#!/usr/bin/env python3
"""Check strings against the banned-word list in brief/creative-brief.md.

Usage: python3 scripts/check_banned.py "string one" "string two" ...
       python3 scripts/check_banned.py --file src/RevenueOS/copy.ts
Exits 1 if any banned word appears. "CRM" is reported as a warning only: the
brief allows it as the thing we sit above, never as what we are.
"""
import re
import sys
from pathlib import Path

BRIEF = Path(__file__).resolve().parent.parent / "brief/creative-brief.md"


def banned_words() -> list[str]:
    for line in BRIEF.read_text().splitlines():
        if line.lower().startswith("chatbot,"):
            return [w.strip() for w in line.split(",") if w.strip()]
    sys.exit("banned-word list not found in brief")


def main() -> None:
    args = sys.argv[1:]
    texts = [Path(args[1]).read_text()] if args[:1] == ["--file"] else args
    failed = False
    for word in banned_words():
        term = re.sub(r"\s*\(.*\)", "", word)  # "CRM (as what we are)" -> "CRM"
        pattern = re.compile(r"\b" + re.escape(term).replace(r"\ ", r"[\s-]+") + r"\b", re.I)
        for text in texts:
            for m in pattern.finditer(text):
                context = text[max(0, m.start() - 30) : m.end() + 30].replace("\n", " ")
                if term == "CRM":
                    print(f"check  CRM (allowed only as what we sit above): ...{context}...")
                else:
                    print(f"BANNED {word!r}: ...{context}...")
                    failed = True
    print("FAIL" if failed else "OK: no banned words")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
