#!/usr/bin/env python3
"""Check that every meeting card has content behind all five language buttons.

Run from any directory; optionally supply individual meeting HTML paths.
Uses only the Python standard library. Transcripts linked inside meetings are
intentionally excluded: this checks the summaries listed on transparency.html.
"""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = {"en", "es", "fr", "it", "de"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.cards = []
        self.buttons = []
        self.blocks = []
        self.stack = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "a" and "meeting-card" in classes:
            self.cards.append(attrs["href"])
        if tag == "button" and attrs.get("data-lang"):
            self.buttons.append(attrs["data-lang"])
        block = None
        if "lang-content" in classes:
            block = {"lang": attrs.get("data-lang"), "active": "active" in classes, "text": [], "nested": any(b is not None for _, b in self.stack)}
            self.blocks.append(block)
        if tag not in VOID:
            self.stack.append((tag, block))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        for _, block in self.stack:
            if block is not None:
                block["text"].append(text)


def check(path):
    page = Page(path.read_text())
    errors = []
    expected = Counter({lang: 1 for lang in LANGUAGES})
    if Counter(page.buttons) != expected:
        errors.append("expected exactly one button per language")
    if Counter(b["lang"] for b in page.blocks) != expected:
        errors.append("expected exactly one content block per language")
    if [b["lang"] for b in page.blocks if b["active"]] != ["en"]:
        errors.append("English must be the only initially active content block")
    for block in page.blocks:
        if block["nested"]:
            errors.append(f"{block['lang']}: language block nested inside another")
        if len(" ".join(block["text"]).strip()) < 100:
            errors.append(f"{block['lang']}: empty or implausibly short content")
    return errors


def main():
    paths = [Path(arg).resolve() for arg in sys.argv[1:]] if len(sys.argv) > 1 else [ROOT / href for href in Page((ROOT / "transparency.html").read_text()).cards]
    failures = 0
    if not paths:
        print("FAIL: no meeting pages found")
        return 1
    for path in paths:
        errors = check(path)
        if errors:
            failures += 1
            print(f"FAIL {path.name}: {'; '.join(errors)}")
    print(f"Checked {len(paths)} meeting pages; {failures} failed.")
    return bool(failures)


if __name__ == "__main__":
    sys.exit(main())
