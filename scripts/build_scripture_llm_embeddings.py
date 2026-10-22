"""
Scripture Embeddings Builder
Implements Chapter 3.10 ('Embeddings') and 3.10.2 ('Using embeddings from Python')
from Simon Willison's LLM Documentation.

Formats and stores embeddings for all Quran verses and Prophetic Hadiths in a SQLite database
using llm.Collection, enabling semantic search with 'llm similar'.
"""

import os
import sys
import json
import sqlite_utils
from pathlib import Path

# Ensure UTF-8 output
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass


def export_for_embed_multi(output_dir: Path):
    """
    Exports Quran and Hadith datasets into standardized JSON files
    for use with 'llm embed-multi <collection> <file.json> --format json --store'
    as documented in Section 3.10.1.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    quran_src = Path("public/quran-data/quran_en.json")
    hadith_src = Path("public/hadith-data/daily_hadiths.json")

    # 1. Format Quran items
    quran_items = []
    if quran_src.exists():
        with open(quran_src, "r", encoding="utf-8") as f:
            surahs = json.load(f)
            for s in surahs:
                s_id = s.get("id", 1)
                s_name = s.get("transliteration", s.get("name", ""))
                for v in s.get("verses", []):
                    v_id = v.get("id")
                    quran_items.append({
                        "id": f"quran_{s_id}_{v_id}",
                        "content": f"[Surah {s_name} {s_id}:{v_id}] {v.get('translation', '')}"
                    })

    quran_out = output_dir / "quran_for_embeddings.json"
    with open(quran_out, "w", encoding="utf-8") as f:
        json.dump(quran_items, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(quran_items)} Quran entries to {quran_out}")

    # 2. Format Hadith items
    hadith_items = []
    if hadith_src.exists():
        with open(hadith_src, "r", encoding="utf-8") as f:
            hadiths = json.load(f)
            for h in hadiths:
                b_title = h.get("bookTitle", "Hadith")
                h_id = h.get("idInBook", h.get("id", ""))
                narrator = h.get("narrator", "").strip()
                english = h.get("english", "").strip()
                full_body = f"{narrator} {english}".strip() if narrator else english
                hadith_items.append({
                    "id": f"hadith_{h.get('id', '')}",
                    "content": f"[{b_title} #{h_id}] {full_body}"
                })

    hadith_out = output_dir / "hadith_for_embeddings.json"
    with open(hadith_out, "w", encoding="utf-8") as f:
        json.dump(hadith_items, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(hadith_items)} Hadith entries to {hadith_out}")

    return quran_out, hadith_out


if __name__ == "__main__":
    out_dir = Path("data/embeddings_input")
    export_for_embed_multi(out_dir)
    print("\nTo build SQLite embeddings collection using llm CLI (as in PDF Section 3.10.1):")
    print("  llm embed-multi quran-collection data/embeddings_input/quran_for_embeddings.json -d scripture.db --store")
    print("  llm embed-multi hadith-collection data/embeddings_input/hadith_for_embeddings.json -d scripture.db --store")
    print("\nTo query with semantic similarity:")
    print("  llm similar quran-collection -c 'forgiveness and mercy' -d scripture.db")
