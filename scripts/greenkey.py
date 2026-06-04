#!/usr/bin/env python3
"""Chroma-key a cloud shot on a flat green screen into a transparent PNG.

Unlike luminance keying, this preserves the cloud's natural gray/blue shading
(so it looks realistic) and only removes the green background + green spill on
the feathered edges.

alpha  := from "greenness" = g - max(r, b)  (high on background, ~0 on clouds)
despill := clamp green so it never exceeds max(r, b)  (kills green fringe)

Usage: python3 scripts/greenkey.py <src.png> <dst.png>
Stdlib only (zlib, struct). 8-bit non-interlaced PNG, color type 2/6.
"""
import struct
import zlib
import sys

# Background green level is detected per-image from the corners; these are
# fractions of that level used to ramp the alpha.
LOW_FRAC = 0.34   # greenness <= LOW_FRAC*bg -> fully opaque cloud
HIGH_FRAC = 0.82  # greenness >= HIGH_FRAC*bg -> fully transparent background


def read_png(path):
    with open(path, "rb") as f:
        data = f.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("not a PNG")
    pos = 8
    width = height = bit_depth = color_type = interlace = None
    idat = bytearray()
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        ctype = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            width, height, bit_depth, color_type, _comp, _filt, interlace = struct.unpack(
                ">IIBBBBB", chunk
            )
        elif ctype == b"IDAT":
            idat += chunk
        elif ctype == b"IEND":
            break
    if bit_depth != 8 or color_type not in (2, 6) or interlace != 0:
        raise SystemExit(
            f"unsupported PNG: depth={bit_depth} color={color_type} interlace={interlace}"
        )
    channels = 4 if color_type == 6 else 3
    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    out = bytearray(width * height * 4)
    prev = bytearray(stride)
    rp = 0
    for y in range(height):
        ftype = raw[rp]
        rp += 1
        line = bytearray(raw[rp : rp + stride])
        rp += stride
        if ftype == 1:
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        op = y * width * 4
        if channels == 4:
            out[op : op + stride] = line
        else:
            for x in range(width):
                s = x * 3
                d = op + x * 4
                out[d] = line[s]
                out[d + 1] = line[s + 1]
                out[d + 2] = line[s + 2]
                out[d + 3] = 255
        prev = line
    return width, height, out


def write_png(path, width, height, rgba):
    stride = width * 4
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        raw += rgba[y * stride : (y + 1) * stride]
    comp = zlib.compress(bytes(raw), 9)

    def chunk(ctype, payload):
        return (
            struct.pack(">I", len(payload))
            + ctype
            + payload
            + struct.pack(">I", zlib.crc32(ctype + payload) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", comp))
        f.write(chunk(b"IEND", b""))


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: greenkey.py <src.png> <dst.png>")
    src, dst = sys.argv[1], sys.argv[2]
    w, h, px = read_png(src)

    # Detect the background green level by sampling the four corners.
    def greenness_at(x, y):
        o = (y * w + x) * 4
        r, g, b = px[o], px[o + 1], px[o + 2]
        return g - (r if r > b else b)

    samples = []
    s = 28
    for cx, cy in ((0, 0), (w - s, 0), (0, h - s), (w - s, h - s)):
        for yy in range(cy, cy + s, 4):
            for xx in range(cx, cx + s, 4):
                samples.append(greenness_at(xx, yy))
    samples.sort()
    bg = samples[len(samples) // 2]  # median corner greenness
    if bg < 30:
        bg = 30
    low = bg * LOW_FRAC
    high = bg * HIGH_FRAC
    span = high - low if high > low else 1.0

    for i in range(w * h):
        o = i * 4
        r, g, b = px[o], px[o + 1], px[o + 2]
        mrb = r if r > b else b
        greenness = g - mrb
        if greenness <= low:
            a = 255
        elif greenness >= high:
            a = 0
        else:
            a = int(255 - (greenness - low) * 255 / span)
        # Green spill suppression: green can't exceed the brighter of r/b.
        if g > mrb:
            g = mrb
        px[o] = r
        px[o + 1] = g
        px[o + 2] = b
        px[o + 3] = a
    write_png(dst, w, h, px)
    cleared = sum(1 for i in range(w * h) if px[i * 4 + 3] == 0)
    print(f"{w}x{h} -> {dst}; transparent {cleared * 100 // (w * h)}%")


if __name__ == "__main__":
    sys.exit(main())
