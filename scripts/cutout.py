#!/usr/bin/env python3
"""Remove the white background from public/image.png using a border flood-fill.

Stdlib only (zlib, struct). Handles 8-bit non-interlaced PNG, color type 2 (RGB)
or 6 (RGBA). Writes an RGBA PNG with the connected white background made
transparent, preserving interior cream/white regions (e.g. jacket sleeves).
"""
import struct
import zlib
import sys
from collections import deque

SRC = "public/image.png"
DST = "public/jacket-cutout.png"

# A pixel counts as "white background" only if every channel is very high.
# Cream (~243,237,224) has a lower blue channel, so it is preserved.
WHITE_MIN = 234
# Looser threshold used for a 1px feather to kill the anti-aliased halo.
FEATHER_MIN = 244


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
        if ftype == 1:  # Sub
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 0xFF
        elif ftype == 2:  # Up
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ftype == 3:  # Average
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:  # Paeth
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        # write into RGBA buffer
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
        raw.append(0)  # filter: none
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
    w, h, px = read_png(SRC)

    def is_white(idx, thresh):
        return px[idx] >= thresh and px[idx + 1] >= thresh and px[idx + 2] >= thresh

    visited = bytearray(w * h)
    q = deque()

    def seed(x, y):
        i = y * w + x
        if not visited[i] and is_white(i * 4, WHITE_MIN):
            visited[i] = 1
            q.append(i)

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while q:
        i = q.popleft()
        x = i % w
        y = i // w
        # make transparent
        px[i * 4 + 3] = 0
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                ni = ny * w + nx
                if not visited[ni] and is_white(ni * 4, WHITE_MIN):
                    visited[ni] = 1
                    q.append(ni)

    # One-pixel feather: very-white opaque pixels touching transparency go clear.
    feather = []
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if px[i * 4 + 3] == 0:
                continue
            if not is_white(i * 4, FEATHER_MIN):
                continue
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and px[(ny * w + nx) * 4 + 3] == 0:
                    feather.append(i)
                    break
    for i in feather:
        px[i * 4 + 3] = 0

    write_png(DST, w, h, px)
    cleared = sum(1 for i in range(w * h) if px[i * 4 + 3] == 0)
    print(f"{w}x{h} -> {DST}; cleared {cleared} px ({cleared * 100 // (w * h)}%)")


if __name__ == "__main__":
    sys.exit(main())
