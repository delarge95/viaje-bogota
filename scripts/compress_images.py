#!/usr/bin/env python3
"""Compress any restaurant image that's larger than ~1MB down to a reasonable size."""
from pathlib import Path
from PIL import Image
import io

IMG_DIR = Path("/home/z/my-project/scripts/restaurant_images")
MAX_BYTES = 1_000_000  # 1 MB soft target
TARGET_LONG_EDGE = 1600  # px

for img_path in sorted(IMG_DIR.glob("*.jpg")):
    size = img_path.stat().st_size
    if size <= MAX_BYTES:
        print(f"  OK  {img_path.name}  {size:>10,} bytes")
        continue

    print(f"  SHRINK {img_path.name}  {size:>10,} bytes -> ", end="", flush=True)
    img = Image.open(img_path)
    # Drop alpha if any
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Resize if larger than TARGET_LONG_EDGE on longest side
    w, h = img.size
    longest = max(w, h)
    if longest > TARGET_LONG_EDGE:
        ratio = TARGET_LONG_EDGE / longest
        new_size = (int(w * ratio), int(h * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    # Try quality levels until under MAX_BYTES
    buf = io.BytesIO()
    for q in (85, 80, 75, 70, 65, 60):
        buf.seek(0)
        buf.truncate()
        img.save(buf, format="JPEG", quality=q, optimize=True, progressive=True)
        if buf.tell() <= MAX_BYTES:
            break
    img.save(img_path, format="JPEG", quality=q, optimize=True, progressive=True)
    new_size = img_path.stat().st_size
    print(f"{new_size:>10,} bytes  (q={q}, {img.size[0]}x{img.size[1]})")
