#!/usr/bin/env python3
"""Continue the image search for the remaining restaurants (Andrés + Paloquemao)."""

import json
import os
import subprocess
import urllib.request
from pathlib import Path

SEARCH_DIR = Path("/home/z/my-project/tool-results/img_search")
IMG_DIR = Path("/home/z/my-project/scripts/restaurant_images")
SEARCH_DIR.mkdir(parents=True, exist_ok=True)
IMG_DIR.mkdir(parents=True, exist_ok=True)

REMAINING = [
    ("andres_fachada",  "Andres Carne de Res Chia restaurante fachada entrada", 5),
    ("andres_plato",    "Andres Carne de Res plato bandeja paisa comida colombiana", 5),
    ("paloquemao_plaza",  "Plaza de Mercado Paloquemao Bogota mercado frutas verduras", 5),
    ("paloquemao_puesto", "Paloquemao mercado empanadas jugos frutas Bogota local", 5),
]


def run_search(basename, query, count):
    cmd = ["z-ai", "image-search", "-q", query, "--count", str(count), "--gl", "us", "--no-rank"]
    print(f"\n>>> [{basename}] {query}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        print("    TIMEOUT")
        return {"success": False, "error": "timeout", "results": []}

    stdout = result.stdout or ""
    idx = stdout.find("{")
    if idx < 0:
        print(f"    NO JSON. stderr: {result.stderr[-200:]}")
        return {"success": False, "error": "no json", "results": []}
    try:
        data = json.loads(stdout[idx:])
    except json.JSONDecodeError as e:
        print(f"    JSON ERR: {e}")
        return {"success": False, "error": "json error", "results": []}

    out_path = SEARCH_DIR / f"{basename}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"    OK: {len(data.get('results', []))} results")
    return data


def download_image(url, dest, timeout=60):
    if dest.exists() and dest.stat().st_size > 1024:
        return True, dest.stat().st_size
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                                   "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
        if len(data) < 1024:
            return False, len(data)
        with open(dest, "wb") as f:
            f.write(data)
        return True, len(data)
    except Exception as e:
        print(f"    DL ERR: {e}")
        return False, 0


def main():
    summary = {}
    for basename, query, count in REMAINING:
        data = run_search(basename, query, count)
        results = data.get("results", [])
        saved_files = []
        for idx, r in enumerate(results[:2]):
            url = r.get("original_url", "")
            if not url:
                continue
            ext = ".jpg"
            if ".png" in url.lower():
                ext = ".png"
            dest = IMG_DIR / f"{basename}_{idx+1}{ext}"
            ok, size = download_image(url, dest)
            if ok:
                saved_files.append({
                    "path": str(dest.relative_to(IMG_DIR)),
                    "size_bytes": size,
                    "source": r.get("source", ""),
                    "url": url,
                })
                print(f"    ✓ {dest.name} ({size:,} bytes, {r.get('source','')})")
        summary[basename] = {"query": query, "count": len(results), "saved": saved_files}

    print("\n=== Remaining searches summary ===")
    for k, v in summary.items():
        print(f"\n{k}:")
        for s in v["saved"]:
            print(f"  ✓ {s['path']} ({s['size_bytes']:,} bytes, src={s['source']})")


if __name__ == "__main__":
    main()
