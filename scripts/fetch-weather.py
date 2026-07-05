#!/usr/bin/env python3
"""Fetch AEMET CAP weather warnings for Sur de Huesca (zone 622203, Los Monegros)
and upsert today's entry into weather-auto.json for the weather-alerts tracker.

Runs daily via GitHub Actions. Requires AEMET_API_KEY env var.
Fire-risk levels are NOT provided by AEMET and remain manually curated in
weather-alerts.html — the page merges: manual entries always win.
"""
import io
import json
import os
import sys
import tarfile
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

API_URL = "https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/62"
ZONE = "622203"  # Sur de Huesca
TZ = ZoneInfo("Europe/Madrid")
NS = {"cap": "urn:oasis:names:tc:emergency:cap:1.2"}
OUT_FILE = os.path.join(os.path.dirname(__file__), "..", "weather-auto.json")

LEVEL_RANK = {"amarillo": 1, "naranja": 2, "roja": 3}
# Spanish level words so the page's tr() localises them per language
LEVEL_WORD = {"amarillo": "Amarillo", "naranja": "Naranja", "roja": "Roja"}
# Phenomenon codes -> short labels (matching the tracker's existing vocabulary)
PHENOMENA = {
    "AT": "max temps", "BT": "min temps", "VI": "wind", "TO": "storms",
    "PR": "rain", "LL": "rain", "NE": "snow", "NI": "fog", "GA": "fog",
    "CO": "coastal", "DP": "dust",
}
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
DOWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def fetch_cap_tar(api_key):
    req = urllib.request.Request(f"{API_URL}?api_key={api_key}")
    with urllib.request.urlopen(req, timeout=60) as r:
        meta = json.load(r)
    if meta.get("estado") != 200:
        sys.exit(f"AEMET API error: {meta}")
    with urllib.request.urlopen(meta["datos"], timeout=120) as r:
        return r.read()


def parse_warnings(tar_bytes):
    """Return dict {date -> {phenomenon_label -> (rank, detail)}} for our zone."""
    out = {}
    with tarfile.open(fileobj=io.BytesIO(tar_bytes)) as tar:
        for member in tar.getmembers():
            if not member.name.endswith(".xml"):
                continue
            try:
                root = ET.fromstring(tar.extractfile(member).read())
            except ET.ParseError:
                continue
            msg_type = root.findtext("cap:msgType", default="", namespaces=NS)
            if msg_type == "Cancel":
                continue
            for info in root.findall("cap:info", NS):
                if info.findtext("cap:language", default="", namespaces=NS) != "es-ES":
                    continue
                area = info.find("cap:area", NS)
                if area is None:
                    continue
                geocode = area.findtext("cap:geocode/cap:value", default="", namespaces=NS)
                if geocode != ZONE:
                    continue
                level, detail, phen_code = None, "", None
                for p in info.findall("cap:parameter", NS):
                    name = p.findtext("cap:valueName", default="", namespaces=NS)
                    val = p.findtext("cap:value", default="", namespaces=NS)
                    if name == "AEMET-Meteoalerta nivel":
                        level = val.strip().lower()
                    elif name == "AEMET-Meteoalerta parametro":
                        parts = val.split(";")
                        if len(parts) >= 3:
                            detail = parts[2].strip()
                for ec in info.findall("cap:eventCode", NS):
                    if ec.findtext("cap:valueName", default="", namespaces=NS) == "AEMET-Meteoalerta fenomeno":
                        phen_code = ec.findtext("cap:value", default="", namespaces=NS).split(";")[0].strip()
                if level not in LEVEL_RANK or not phen_code:
                    continue
                onset = info.findtext("cap:onset", default="", namespaces=NS)
                if not onset:
                    continue
                try:
                    onset_date = datetime.fromisoformat(onset).astimezone(TZ).date()
                except ValueError:
                    continue
                label = PHENOMENA.get(phen_code, phen_code.lower())
                day = out.setdefault(onset_date, {})
                rank = LEVEL_RANK[level]
                if label not in day or rank > day[label][0]:
                    day[label] = (rank, detail)
    return out


def summarise(day_warnings):
    """'Naranja max temps (40 ºC) + Amarillo storms' or None."""
    if not day_warnings:
        return None
    rank_to_level = {v: k for k, v in LEVEL_RANK.items()}
    parts = []
    for label, (rank, detail) in sorted(day_warnings.items(), key=lambda kv: -kv[1][0]):
        word = LEVEL_WORD[rank_to_level[rank]]
        parts.append(f"{word} {label}" + (f" ({detail})" if detail else ""))
    return " + ".join(parts)


def main():
    api_key = os.environ.get("AEMET_API_KEY")
    if not api_key:
        sys.exit("AEMET_API_KEY not set")

    now = datetime.now(TZ)
    today, tomorrow = now.date(), now.date() + timedelta(days=1)

    warnings = parse_warnings(fetch_cap_tar(api_key))
    today_sum = summarise(warnings.get(today))
    tomorrow_sum = summarise(warnings.get(tomorrow))

    entry = {
        "date": f"{today.day} {MONTHS[today.month - 1]}",
        "dow": DOWS[today.weekday()],
        "level": "pendiente",  # fire level confirmed manually; grey until then
        "fire": "\u2014",
        "heat": today_sum or "\u2014",
        "restrictions": False,
        "tomorrow": tomorrow_sum or "\u2014",
        "note": "",
        "auto": True,
        "updated": now.isoformat(timespec="minutes"),
    }

    try:
        with open(OUT_FILE, encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []

    data = [d for d in data if d.get("date") != entry["date"]]
    data.append(entry)
    data = data[-40:]  # keep bounded

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Updated {entry['date']}: today='{entry['heat']}' tomorrow='{entry['tomorrow']}'")


if __name__ == "__main__":
    main()
