#!/usr/bin/env python3
"""Turn a cloud rendered on a solid black background into a transparent PNG.

Luminance keying: alpha = brightness of the pixel (black bg -> alpha 0, white
cloud -> alpha 1). This gives clean, halo-free soft edges, which is exactly how
smoke/cloud cutouts are normally done. RGB is pushed toward white so the cloud
reads bright over a light-blue sky.

Usage: python3 scripts/cloudcut.py <src.png> <dst.png>
Stdlib only (zlib, struct). Handles 8-bit non-interlaced PNG, color type 2/6.
"""
import struct
import zlib
import sys

# Pixels darker than this are pure background -> fully transparent.
BLACK_POINT = 14
# Pixels brighter than this are solid cloud -> fully opaque.
WHITE_POINT = 200


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
        raise SystemExit("usage: cloudcut.py <src.png> <dst.png>")
    src, dst = sys.argv[1], sys.argv[2]
    w, h, px = read_png(src)
    span = WHITE_POINT - BLACK_POINT
    for i in range(w * h):
        o = i * 4
        r, g, b = px[o], px[o + 1], px[o + 2]
        luma = (54 * r + 183 * g + 19 * b) >> 8  # ~0.21/0.72/0.07
        if luma <= BLACK_POINT:
            a = 0
        elif luma >= WHITE_POINT:
            a = 255
        else:
            a = ((luma - BLACK_POINT) * 255) // span
        # Brighten the cloud body toward white; keep a touch of original shading.
        px[o] = min(255, (r + 255) >> 1)
        px[o + 1] = min(255, (g + 255) >> 1)
        px[o + 2] = min(255, (b + 255) >> 1)
        px[o + 3] = a
    write_png(dst, w, h, px)
    cleared = sum(1 for i in range(w * h) if px[i * 4 + 3] == 0)
    print(f"{w}x{h} -> {dst}; transparent {cleared * 100 // (w * h)}%")


if __name__ == "__main__":
    sys.exit(main())
