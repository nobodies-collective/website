#!/usr/bin/env python3
"""Build the public evidence tables used by event-dates-2027.html.

Sources:
  * Open-Meteo Historical Weather API (ERA5 / ERA5-Land best match)
  * Gobierno de Aragón daily NAPIF PDF archive

The script deliberately keeps the derived CSVs in the repository but not the
hundreds of source PDFs. Every NAPIF row includes the official source URL.

Requirements:
  * Python 3.10+
  * curl
  * pdftotext and pdfimages (Poppler)
  * Pillow
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import math
import re
import subprocess
import tempfile
import unicodedata
import urllib.parse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


SITE_LATITUDE = 41.7005615
SITE_LONGITUDE = -0.1363139
CLIMATE_START_YEAR = 2006
CLIMATE_END_YEAR = 2025
NORMAL_START_YEAR = 1991
NORMAL_END_YEAR = 2020
NAPIF_START_MONTH_DAY = (6, 1)
NAPIF_END_MONTH_DAY = (10, 15)
NAPIF_PARTIAL_2026_END = dt.date(2026, 8, 11)
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "event-dates-2027"

NAPIF_LEVEL_COLOURS = {
    "green": (56, 168, 0),
    "yellow": (255, 255, 0),
    "orange": (255, 119, 0),
    "red": (255, 0, 0),
    "red_plus": (153, 0, 0),
}

# The site sits within the Muela de Alcubierre polygon at this stable
# proportional position in the current-day map embedded in each report.
NAPIF_SITE_MAP_POSITION = (0.692, 0.397)

OPEN_METEO_URL = "https://archive-api.open-meteo.com/v1/archive"
NAPIF_URL = (
    "https://infoar.aragon.es/flamabk/indicesMeteo/napif-pdf/download"
    "?fecha={date}"
)


def percentile(values: list[float], fraction: float) -> float:
    ordered = sorted(values)
    position = (len(ordered) - 1) * fraction
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    return (
        ordered[lower] * (upper - position)
        + ordered[upper] * (position - lower)
    )


def candidate_weeks() -> list[tuple[dt.date, dt.date]]:
    weeks = []
    start = dt.date(2027, 5, 3)
    while start <= dt.date(2027, 10, 17):
        weeks.append((start, start + dt.timedelta(days=6)))
        start += dt.timedelta(days=7)
    return weeks


def same_month_day(date_2027: dt.date, year: int) -> dt.date:
    return dt.date(year, date_2027.month, date_2027.day)


def date_range(start: dt.date, end: dt.date):
    current = start
    while current <= end:
        yield current
        current += dt.timedelta(days=1)


def fetch_json(url: str) -> dict:
    result = subprocess.run(
        [
            "curl",
            "-LfsS",
            "--max-time",
            "180",
            "-A",
            "NobodiesCollective-event-date-research/1.0",
            url,
        ],
        check=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


def climate_url() -> str:
    params = {
        "latitude": SITE_LATITUDE,
        "longitude": SITE_LONGITUDE,
        "start_date": f"{NORMAL_START_YEAR}-01-01",
        "end_date": f"{CLIMATE_END_YEAR}-12-31",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
        "timezone": "Europe/Madrid",
    }
    return f"{OPEN_METEO_URL}?{urllib.parse.urlencode(params)}"


def build_climate_csv(output_dir: Path) -> None:
    url = climate_url()
    source = fetch_json(url)
    daily = source["daily"]
    by_date = {
        dt.date.fromisoformat(date): {
            "high": high,
            "low": low,
            "rain": rain,
        }
        for date, high, low, rain in zip(
            daily["time"],
            daily["temperature_2m_max"],
            daily["temperature_2m_min"],
            daily["precipitation_sum"],
        )
    }

    rows = []
    for start, end in candidate_weeks():
        month_days = [
            (start + dt.timedelta(days=offset)).strftime("%m-%d")
            for offset in range(7)
        ]
        recent_weeks = []
        normal_days = []
        for year in range(CLIMATE_START_YEAR, CLIMATE_END_YEAR + 1):
            recent_weeks.append(
                [
                    by_date[
                        dt.date(year, int(month_day[:2]), int(month_day[3:]))
                    ]
                    for month_day in month_days
                ]
            )
        for year in range(NORMAL_START_YEAR, NORMAL_END_YEAR + 1):
            normal_days.extend(
                [
                    by_date[
                        dt.date(year, int(month_day[:2]), int(month_day[3:]))
                    ]
                    for month_day in month_days
                ]
            )

        recent_days = [day for week in recent_weeks for day in week]
        highs = [day["high"] for day in recent_days]
        lows = [day["low"] for day in recent_days]
        rain = [day["rain"] for day in recent_days]
        weekly_rain = [sum(day["rain"] for day in week) for week in recent_weeks]
        normal_highs = [day["high"] for day in normal_days]

        rows.append(
            {
                "week_start_2027": start.isoformat(),
                "week_end_2027": end.isoformat(),
                "median_daily_high_c": round(percentile(highs, 0.50), 1),
                "p95_daily_high_c": round(percentile(highs, 0.95), 1),
                "median_daily_low_c": round(percentile(lows, 0.50), 1),
                "p05_daily_low_c": round(percentile(lows, 0.05), 1),
                "wet_day_probability_pct": round(
                    100 * sum(value >= 1 for value in rain) / len(rain)
                ),
                "years_with_wet_week_pct": round(
                    100
                    * sum(value >= 1 for value in weekly_rain)
                    / len(weekly_rain)
                ),
                "mean_weekly_rain_mm": round(sum(weekly_rain) / len(weekly_rain), 1),
                "p90_weekly_rain_mm": round(percentile(weekly_rain, 0.90), 1),
                "mean_days_at_or_above_35c": round(
                    sum(value >= 35 for value in highs)
                    / (CLIMATE_END_YEAR - CLIMATE_START_YEAR + 1),
                    1,
                ),
                "mean_nights_at_or_above_20c": round(
                    sum(value >= 20 for value in lows)
                    / (CLIMATE_END_YEAR - CLIMATE_START_YEAR + 1),
                    1,
                ),
                "recent_vs_1991_2020_mean_high_delta_c": round(
                    sum(highs) / len(highs)
                    - sum(normal_highs) / len(normal_highs),
                    1,
                ),
                "source_url": url,
            }
        )

    write_csv(output_dir / "climate-weekly.csv", rows)


def ascii_normalise(text: str) -> str:
    text = (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode()
        .lower()
    )
    return re.sub(r"\s+", " ", text)


def napif_section(text: str, level: str):
    patterns = {
        "red_plus": (
            r"(?:zonas|comarcas) en alerta roj[ao] plus(?: hoy)?[^:]*:\s*(.*?)"
            r"(?=(?:zonas|comarcas) en alerta roj[ao] plus(?: manana)?|"
            r"el resto|combustible muerto|propagacion)"
        ),
        "red": (
            r"(?:zonas|comarcas) en alerta roj[ao](?: hoy)?[^:]*:\s*(.*?)"
            r"(?=(?:zonas|comarcas) en alerta roj[ao](?: manana)?|"
            r"el resto|combustible muerto|propagacion)"
        ),
        "orange": (
            r"zonas en alerta naranja(?: hoy)?[^:]*:\s*(.*?)"
            r"(?=zonas en alerta naranja manana|combustible muerto|propagacion)"
        ),
    }
    return re.search(patterns[level], text)


def classify_napif(text: str) -> str:
    """Return the level applying at Castejón de Monegros.

    The official municipality-to-zone table assigns Castejón de Monegros to
    Muelas del Ebro–Alcubierre (later reports shorten this to Muela de
    Alcubierre). Red Plus reports in 2026 were issued by comarca; the site is
    in Los Monegros.
    """

    text = ascii_normalise(text)

    match = napif_section(text, "red_plus")
    if match and any(
        token in match.group(1)
        for token in ("todo aragon", "los monegros", "alcubierre")
    ):
        return "red_plus"

    if (
        "alerta rojo plus de incendios" in text
        or "alerta roja plus de incendios" in text
    ) and "todo aragon" in text:
        return "red_plus"

    match = napif_section(text, "red")
    if match and "alcubierre" in match.group(1):
        return "red"

    if (
        "alerta rojo plus de incendios" in text
        or "alerta roja plus de incendios" in text
    ) and re.search(r"el resto .* alerta roj", text):
        return "red"

    match = napif_section(text, "orange")
    if match and "alcubierre" in match.group(1):
        return "orange"

    return "yellow"


def colour_distance(first: tuple[int, int, int], second: tuple[int, int, int]) -> int:
    return sum((first[index] - second[index]) ** 2 for index in range(3))


def classify_napif_map(pdf_path: Path) -> str:
    """Read Castejón de Monegros' exact level from the official map.

    The report prose generally lists only the zones at the highest alert
    level. Treating every unlisted zone as Yellow therefore misclassifies
    explicit Green areas, especially late in the season. The embedded map
    contains the complete zone-level classification.
    """

    with tempfile.TemporaryDirectory() as directory:
        prefix = Path(directory) / "napif"
        subprocess.run(
            [
                "pdfimages",
                "-f",
                "1",
                "-l",
                "1",
                "-png",
                str(pdf_path),
                str(prefix),
            ],
            check=True,
            capture_output=True,
        )

        map_candidates = []
        for image_path in sorted(Path(directory).glob("napif-*.png")):
            image = Image.open(image_path).convert("RGB")
            width, height = image.size
            if width < 500 or height < 700:
                continue

            colours = image.getcolors(maxcolors=10_000_000) or []
            mapped_pixels = sum(
                count
                for count, colour in colours
                if min(
                    colour_distance(colour, reference)
                    for reference in NAPIF_LEVEL_COLOURS.values()
                ) < 400
            )
            if mapped_pixels > width * height * 0.02:
                map_candidates.append(image)

        if not map_candidates:
            raise RuntimeError(f"Could not find the current-day map in {pdf_path}")
        current_map = max(
            map_candidates,
            key=lambda image: image.width * image.height,
        )

        width, height = current_map.size
        centre_x = round(NAPIF_SITE_MAP_POSITION[0] * width)
        centre_y = round(NAPIF_SITE_MAP_POSITION[1] * height)
        votes = Counter()
        for x in range(centre_x - 8, centre_x + 9):
            for y in range(centre_y - 8, centre_y + 9):
                colour = current_map.getpixel((x, y))
                level, distance = min(
                    (
                        (level, colour_distance(colour, reference))
                        for level, reference in NAPIF_LEVEL_COLOURS.items()
                    ),
                    key=lambda item: item[1],
                )
                if distance < 2_500:
                    votes[level] += 1

        if not votes:
            raise RuntimeError(
                f"Could not read the site colour from the map in {pdf_path}"
            )
        return votes.most_common(1)[0][0]


def classify_napif_report(date: dt.date, cache_dir: Path) -> tuple[dt.date, str]:
    pdf = download_napif_pdf(date, cache_dir)
    try:
        level = classify_napif_map(pdf)
        if level == "red_plus":
            text = ascii_normalise(pdf_first_page_text(pdf))
            if (
                "alerta rojo plus de incendios" not in text
                and "alerta roja plus de incendios" not in text
            ):
                # Before Red Plus was introduced, the standard Red map colour
                # used the same dark-red RGB value.
                level = "red"
        return date, level
    except RuntimeError:
        # A few Red Plus bulletins use a special, text-heavy layout without
        # the standard embedded map. Their prose explicitly identifies the
        # affected comarca or all Aragón.
        return date, classify_napif(pdf_first_page_text(pdf))


def download_napif_pdf(date: dt.date, cache_dir: Path) -> Path:
    cache_dir.mkdir(parents=True, exist_ok=True)
    path = cache_dir / f"{date.isoformat()}.pdf"
    if path.exists() and path.stat().st_size > 1_000:
        return path
    subprocess.run(
        [
            "curl",
            "-kLfsS",
            "--max-time",
            "120",
            NAPIF_URL.format(date=date.isoformat()),
            "-o",
            str(path),
        ],
        check=True,
    )
    return path


def pdf_first_page_text(pdf_path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-f", "1", "-l", "1", "-layout", str(pdf_path), "-"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout


def napif_dates():
    for year in (2023, 2024, 2025, 2026):
        start = dt.date(year, *NAPIF_START_MONTH_DAY)
        end = (
            NAPIF_PARTIAL_2026_END
            if year == 2026
            else dt.date(year, *NAPIF_END_MONTH_DAY)
        )
        yield from date_range(start, end)


def build_napif_csvs(output_dir: Path, cache_dir: Path) -> None:
    daily_rows = []
    levels = {}

    dates = list(napif_dates())
    with ThreadPoolExecutor(max_workers=8) as executor:
        classified = executor.map(
            lambda date: classify_napif_report(date, cache_dir),
            dates,
        )

    for date, level in classified:
        levels[date] = level
        daily_rows.append(
            {
                "date": date.isoformat(),
                "municipality": "Castejón de Monegros",
                "meteoalerta_zone": "Muelas del Ebro - Alcubierre",
                "comarca": "Los Monegros",
                "level": level,
                "source_url": NAPIF_URL.format(date=date.isoformat()),
            }
        )

    write_csv(output_dir / "napif-daily-2023-2026.csv", daily_rows)

    weekly_rows = []
    for start, end in candidate_weeks():
        row = {
            "week_start_2027": start.isoformat(),
            "week_end_2027": end.isoformat(),
        }
        for year in (2023, 2024, 2025, 2026):
            dates = []
            for offset in range(7):
                date_2027 = start + dt.timedelta(days=offset)
                date = same_month_day(date_2027, year)
                if date in levels:
                    dates.append(date)
            counts = Counter(levels[date] for date in dates)
            prefix = str(year)
            row[f"{prefix}_days_available"] = len(dates)
            row[f"{prefix}_green"] = counts["green"]
            row[f"{prefix}_yellow"] = counts["yellow"]
            row[f"{prefix}_orange"] = counts["orange"]
            row[f"{prefix}_red"] = counts["red"]
            row[f"{prefix}_red_plus"] = counts["red_plus"]
            row[f"{prefix}_red_dates"] = " | ".join(
                date.isoformat() for date in dates if levels[date] == "red"
            )
            row[f"{prefix}_red_plus_dates"] = " | ".join(
                date.isoformat() for date in dates if levels[date] == "red_plus"
            )

        envelope_start = same_month_day(start, 2026) - dt.timedelta(days=21)
        envelope_end = same_month_day(end, 2026) + dt.timedelta(days=10)
        envelope_dates = list(date_range(envelope_start, envelope_end))
        available = [
            date
            for date in envelope_dates
            if date in levels
        ]
        envelope_counts = Counter(levels[date] for date in available)
        proxy_dates = []
        outside_season_dates = []
        unavailable_dates = []
        estimated_levels = [levels[date] for date in available]

        for date in envelope_dates:
            if date in levels:
                continue
            if date > NAPIF_PARTIAL_2026_END:
                if (date.month, date.day) > NAPIF_END_MONTH_DAY:
                    outside_season_dates.append(date)
                    continue
                proxy_date = same_month_day(date, 2025)
                if proxy_date in levels:
                    proxy_dates.append(date)
                    estimated_levels.append(levels[proxy_date])
                    continue
            unavailable_dates.append(date)

        estimated_counts = Counter(estimated_levels)
        estimate_complete = not unavailable_dates
        row["2026_operating_envelope_start"] = envelope_start.isoformat()
        row["2026_operating_envelope_end"] = envelope_end.isoformat()
        row["2026_operating_envelope_days_available"] = len(available)
        row["2026_operating_envelope_red"] = envelope_counts["red"]
        row["2026_operating_envelope_red_plus"] = envelope_counts["red_plus"]
        row["2026_operating_envelope_estimate_complete"] = int(estimate_complete)
        row["2026_operating_envelope_estimated"] = int(bool(proxy_dates))
        row["2026_operating_envelope_estimated_red"] = estimated_counts["red"]
        row["2026_operating_envelope_estimated_red_plus"] = estimated_counts[
            "red_plus"
        ]
        row["2026_operating_envelope_proxy_days"] = len(proxy_dates)
        row["2026_operating_envelope_outside_season_days"] = len(
            outside_season_dates
        )
        row["2026_operating_envelope_unavailable_days"] = len(unavailable_dates)
        row["source_archive_url"] = (
            "https://infoar.aragon.es/flamabk/indicesMeteo/"
            "descarga-informe?indice=NAPIF"
        )
        weekly_rows.append(row)

    write_csv(output_dir / "napif-weekly.csv", weekly_rows)


def write_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(
            output,
            fieldnames=list(rows[0].keys()),
            lineterminator="\n",
        )
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=Path("/tmp/nobodies-event-dates-napif"),
        help="Directory for downloaded official NAPIF PDFs",
    )
    parser.add_argument(
        "--skip-climate", action="store_true", help="Do not rebuild climate CSV"
    )
    parser.add_argument(
        "--skip-napif", action="store_true", help="Do not rebuild NAPIF CSVs"
    )
    args = parser.parse_args()

    if not args.skip_climate:
        build_climate_csv(OUTPUT_DIR)
    if not args.skip_napif:
        build_napif_csvs(OUTPUT_DIR, args.cache_dir)


if __name__ == "__main__":
    main()
