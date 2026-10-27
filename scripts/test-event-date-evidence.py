#!/usr/bin/env python3
"""Offline integrity checks; run with the evidence builder's Pillow environment."""
import collections
import csv
import datetime as dt
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "event-dates-2027"
SPEC = importlib.util.spec_from_file_location(
    "evidence", ROOT / "scripts" / "build-event-date-evidence.py"
)
evidence = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(evidence)


def read_csv(path):
    with path.open(encoding="utf-8", newline="") as source:
        return list(csv.DictReader(source))


class EvidenceTests(unittest.TestCase):
    def test_daily_coverage_and_sources(self):
        rows = read_csv(DATA / "napif-daily-2023-2026.csv")
        self.assertEqual(len(rows), 549)
        self.assertEqual(
            [row["date"] for row in rows],
            [date.isoformat() for date in evidence.napif_dates()],
        )
        for row in rows:
            self.assertIn(row["level"], evidence.NAPIF_LEVEL_COLOURS)
            self.assertEqual(
                row["source_url"], evidence.NAPIF_URL.format(date=row["date"])
            )
        additions = [row for row in rows if row["date"] > "2026-09-18"]
        self.assertEqual(len(additions), 28)
        self.assertEqual(
            collections.Counter(row["level"] for row in additions),
            {"green": 17, "yellow": 7, "orange": 4},
        )
        self.assertEqual(rows[-1]["date"], "2026-10-16")

    def test_weekly_counts_and_operating_windows(self):
        levels = {
            dt.date.fromisoformat(row["date"]): row["level"]
            for row in read_csv(DATA / "napif-daily-2023-2026.csv")
        }
        for row in read_csv(DATA / "napif-weekly.csv"):
            start = dt.date.fromisoformat(row["week_start_2027"])
            for year in (2023, 2024, 2025, 2026):
                dates = [
                    evidence.same_month_day(start + dt.timedelta(days=i), year)
                    for i in range(7)
                ]
                counts = collections.Counter(
                    levels[date] for date in dates if date in levels
                )
                self.assertEqual(
                    int(row[f"{year}_days_available"]), sum(counts.values())
                )
                for level in evidence.NAPIF_LEVEL_COLOURS:
                    self.assertEqual(int(row[f"{year}_{level}"]), counts[level])
            self.assertEqual(int(row["2026_operating_envelope_estimated"]), 0)
            self.assertEqual(int(row["2026_operating_envelope_proxy_days"]), 0)
            first = dt.date.fromisoformat(row["2026_operating_envelope_start"])
            last = dt.date.fromisoformat(row["2026_operating_envelope_end"])
            dates = list(evidence.date_range(first, last))
            actual = [date for date in dates if date in levels]
            outside = [date for date in dates if date > evidence.NAPIF_2026_END]
            missing = len(dates) - len(actual) - len(outside)
            self.assertEqual(len(dates), 38)
            self.assertEqual(
                int(row["2026_operating_envelope_days_available"]), len(actual)
            )
            self.assertEqual(
                int(row["2026_operating_envelope_outside_season_days"]), len(outside)
            )
            self.assertEqual(
                int(row["2026_operating_envelope_unavailable_days"]), missing
            )
            for level in ("red", "red_plus"):
                self.assertEqual(
                    int(row[f"2026_operating_envelope_{level}"]),
                    sum(levels[date] == level for date in actual),
                )

    def test_rebuild_is_offline_and_byte_identical(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            daily = DATA / "napif-daily-2023-2026.csv"
            (output / daily.name).write_bytes(daily.read_bytes())
            with patch.object(
                evidence, "classify_napif_report",
                side_effect=AssertionError("Unexpected network fetch"),
            ):
                evidence.build_napif_csvs(output, output / "cache", reuse_daily=True)
            for name in ("napif-daily-2023-2026.csv", "napif-weekly.csv"):
                self.assertEqual((output / name).read_bytes(), (DATA / name).read_bytes())


if __name__ == "__main__":
    unittest.main()
