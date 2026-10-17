#!/usr/bin/env python3
"""Bounded regressions for the between-events content rollover."""
from html.parser import HTMLParser
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit, unquote
import importlib.util
import os
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("notices", ROOT / "scripts/edition-notices.py")
notices = importlib.util.module_from_spec(spec)
spec.loader.exec_module(notices)
page_spec = importlib.util.spec_from_file_location("pages", ROOT / "scripts/check-meeting-translations.py")
pages = importlib.util.module_from_spec(page_spec)
page_spec.loader.exec_module(pages)
BASE = os.environ.get("ROLLOVER_BASE", "HEAD")


def original(name):
    return subprocess.check_output(["git", "show", f"{BASE}:{name}"], cwd=ROOT,
                                   stderr=subprocess.DEVNULL)


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ("href", "src") and value:
                self.links.append(value)


def broken(name, text):
    result = set()
    for link in Links(text).links:
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        path = unquote(parsed.path)
        target = ROOT / path.lstrip("/") if path.startswith("/") else (ROOT / name).parent / path
        if not target.exists():
            result.add(link)
    return result


class RolloverTests(unittest.TestCase):
    def test_static_notices_are_current_and_idempotent(self):
        for name in notices.PAGES:
            with self.subTest(page=name):
                text = (ROOT / name).read_text()
                self.assertEqual(notices.render(text, weather=name == "weather-alerts.html"), text)
                blocks = list(notices.BLOCK.finditer(text))
                self.assertEqual(text.count("<!-- edition-notice:start -->"), len(blocks) or 1)

    def test_protected_material_untouched(self):
        # One-off scope audit, not a permanent freeze on future ALM/legal edits.
        if "ROLLOVER_BASE" not in os.environ:
            self.skipTest("set ROLLOVER_BASE to audit the scope of this rollover")
        names = ["alm-2026.html", "alm-programme.html", "alm-schedule.html",
                 "alm-whats-on.html", "terms.html", "refund-policy.html",
                 "privacy-policy.html", "travel-reimbursement.html", "expenses.html",
                 "transparency.html"]
        names += [str(p.relative_to(ROOT)) for p in (ROOT / "transparency").rglob("*") if p.is_file()]
        names += [str(p.relative_to(ROOT)) for p in ROOT.rglob("*.pdf")]
        for name in names:
            with self.subTest(page=name):
                self.assertEqual((ROOT / name).read_bytes(), original(name))

    def test_new_local_links_resolve(self):
        changed = subprocess.check_output(
            ["git", "diff", "--name-only", BASE], cwd=ROOT, text=True).splitlines()
        changed += ["2026-archive.html"]
        for name in changed:
            path = ROOT / name
            if not name.endswith(".html") or not path.exists():
                continue
            try:
                previous = original(name).decode()
            except subprocess.CalledProcessError:
                previous = ""
            with self.subTest(page=name):
                self.assertEqual(broken(name, path.read_text()) - broken(name, previous), set())

    def test_obsolete_draft_removed(self):
        self.assertFalse((ROOT / "draft-candidate-weeks-2027.html").exists())

    def test_existing_language_blocks_preserved(self):
        changed = subprocess.check_output(
            ["git", "diff", "--name-only", BASE], cwd=ROOT, text=True).splitlines()
        for name in changed:
            path = ROOT / name
            if not name.endswith(".html") or not path.exists():
                continue
            try:
                previous = original(name).decode()
            except subprocess.CalledProcessError:
                self.assertEqual(pages.check(path), [], name)
                continue
            before = pages.Page(previous)
            after = pages.Page(path.read_text())
            with self.subTest(page=name):
                self.assertEqual(Counter(b["lang"] for b in before.blocks),
                                 Counter(b["lang"] for b in after.blocks))
                self.assertEqual([b["lang"] for b in before.blocks if b["active"]],
                                 [b["lang"] for b in after.blocks if b["active"]])
                self.assertFalse(any(b["nested"] for b in after.blocks))

    def test_weather_is_not_live(self):
        text = (ROOT / "weather-alerts.html").read_text()
        self.assertNotIn("fetch('weather-auto.json'", text)
        self.assertIn("not live alerts", text)
        self.assertIn("Archived notices: 12–16 July 2026", text)


if __name__ == "__main__":
    unittest.main()
