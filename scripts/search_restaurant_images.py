#!/usr/bin/env python3
"""
Search and download real images of restaurant menus and facades in Bogotá.
Uses the z-ai image-search CLI (ZAI in-house image search service).

For each restaurant, runs 2 queries:
  1. Facade/interior photo (real photo of the place)
  2. Signature dish or menu photo

Saves results JSON to /home/z/my-project/tool-results/img_search/<name>.json
Downloads the actual image files to /home/z/my-project/scripts/restaurant_images/<name>.jpg
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path
import urllib.request

SEARCH_DIR = Path("/home/z/my-project/tool-results/img_search")
IMG_DIR = Path("/home/z/my-project/scripts/restaurant_images")
SEARCH_DIR.mkdir(parents=True, exist_ok=True)
IMG_DIR.mkdir(parents=True, exist_ok=True)

# Each entry: (output_basename, query, count)
# Facade/interior searches first, then dish/menu
SEARCHES = [
    # Vitto (Zona G)
    ("vitto_fachada",   "Vitto restaurante Bogota Zona G Calle 69 interior comedor", 5),
    ("vitto_plato",     "Vitto restaurante Bogota pasta risotto plato comida italiana", 5),
    # La Puerta Falsa
    ("la_puerta_falsa_fachada", "La Puerta Falsa restaurante Bogota La Candelaria fachada entrada", 5),
    ("la_puerta_falsa_ajiaco",  "ajiaco santafereño sopa tradicional Bogota La Puerta Falsa", 5),
    # La Puerta de la Catedral
    ("la_puerta_catedral_fachada", "La Puerta de la Catedral restaurante Bogota fachada", 5),
    ("la_puerta_catedral_plato",   "bandeja paisa plato tradicional colombiano restaurante Bogota", 5),
    # Edelweiss Cajicá
    ("edelweiss_fachada", "Edelweiss restaurante Cajica fachada aleman suizo", 5),
    ("edelweiss_codillo", "codillo cerdo asado aleman plato restaurante Edelweiss", 5),
    # Chigüiro Parrilla Bar
    ("chiguiro_fachada",  "Chiguiro Parrilla Bar Bogota Cra 70 Normandia fachada", 5),
    ("chiguiro_plato",    "chiguiro asado parrilla colombiano plato carne Bogota", 5),
    # Andrés Carne de Res Chía
    ("andres_fachada",  "Andres Carne de Res Chia restaurante fachada entrada", 5),
    ("andres_plato",    "Andres Carne de Res plato bandeja paisa comida colombiana", 5),
    # Paloquemao
    ("paloquemao_plaza",  "Plaza de Mercado Paloquemao Bogota mercado frutas verduras", 5),
    ("paloquemao_puesto", "Paloquemao mercado empanadas jugos frutas Bogota local", 5),
]

def run_search(basename: str, query: str, count: int) -> dict:
    """Run z-ai image-search and return the parsed JSON response."""
    out_path = SEARCH_DIR / f"{basename}.json"
    cmd = [
        "z-ai", "image-search",
        "-q", query,
        "--count", str(count),
        "--gl", "us",
        "--no-rank",
    ]
    print(f"\n>>> [{basename}] {query}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    except subprocess.TimeoutExpired:
        print(f"    TIMEOUT (180s)")
        return {"success": False, "error": "timeout", "results": []}

    # z-ai prints JSON to stdout (the -o flag is unreliable in this version)
    stdout = result.stdout or ""
    # The CLI prints status lines before the JSON; locate the first '{'
    idx = stdout.find("{")
    if idx < 0:
        print(f"    NO JSON in stdout. stderr: {result.stderr[-300:]}")
        return {"success": False, "error": "no json", "results": []}
    json_text = stdout[idx:]
    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as e:
        print(f"    JSON PARSE ERROR: {e}")
        # Save raw stdout for debugging
        with open(str(out_path) + ".raw", "w", encoding="utf-8") as f:
            f.write(stdout)
        return {"success": False, "error": "json error", "results": []}

    # Save parsed JSON
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    if not data.get("success"):
        print(f"    SEARCH FAILED: {data.get('error', 'unknown')}")
        return data

    n = len(data.get("results", []))
    print(f"    OK: {n} results")
    return data


def download_image(url: str, dest: Path, timeout: int = 60) -> tuple[bool, int]:
    """Download image from URL to dest. Returns (success, size_bytes)."""
    if dest.exists() and dest.stat().st_size > 1024:
        return True, dest.stat().st_size
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                              "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            },
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
        if len(data) < 1024:
            return False, len(data)
        with open(dest, "wb") as f:
            f.write(data)
        return True, len(data)
    except Exception as e:
        print(f"    DOWNLOAD ERROR for {url[:80]}: {e}")
        return False, 0


def main():
    summary = {}
    for basename, query, count in SEARCHES:
        data = run_search(basename, query, count)
        results = data.get("results", [])
        saved_files = []
        # Save up to 2 best images per query (we want 1-2 per restaurant concept)
        for idx, r in enumerate(results[:2]):
            url = r.get("original_url", "")
            if not url:
                continue
            # Pick extension based on URL or default to .jpg
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
                    "width": r.get("original_width", ""),
                    "height": r.get("original_height", ""),
                    "url": url,
                })
                print(f"    ✓ {dest.name} ({size:,} bytes, {r.get('source','')})")
        summary[basename] = {
            "query": query,
            "count": len(results),
            "saved": saved_files,
        }

    # Write summary
    summary_path = SEARCH_DIR / "summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"\n=== Summary written to {summary_path} ===")

    # Print final report
    print("\n" + "="*70)
    print("FINAL REPORT")
    print("="*70)
    total_images = 0
    for basename, info in summary.items():
        print(f"\n{basename}:")
        print(f"  query: {info['query']}")
        print(f"  results returned: {info['count']}")
        if not info["saved"]:
            print(f"  ⚠ NO IMAGES SAVED")
        for s in info["saved"]:
            print(f"  ✓ {s['path']} ({s['size_bytes']:,} bytes, src={s['source']})")
            total_images += 1
    print(f"\nTOTAL IMAGES SAVED: {total_images}")


if __name__ == "__main__":
    main()
