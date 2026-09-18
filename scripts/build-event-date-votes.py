"""Validate matching Humans exports and create public, metadata-free vote files.

Usage: python3 scripts/build-event-date-votes.py /path/to/export.json /path/to/export.csv
Only ballot contents are retained; source files are never modified.
"""
import csv
import io
import json
from pathlib import Path
import sys


def build(json_path, csv_path):
    source = json.loads(Path(json_path).read_text())
    question = next(q for q in source["Questions"] if q["Type"] == "RankedChoice")
    options = question["Options"]
    values = {o["Value"] for o in options}
    ballots = []
    ids = []
    for row in source["Rows"]:
        ids.append(row["ResponseId"])
        answers = [a for a in row["Answers"] if a["QuestionId"] == question["QuestionId"]]
        assert len(answers) == 1, "Missing/duplicate ranked answer"
        ballot = answers[0]["RankedBallot"]
        groups, rejected = ballot["RankGroups"], ballot["Rejected"]
        assert all(groups), "Empty rank group"
        all_values = [v for group in groups for v in group] + rejected
        assert len(all_values) == len(set(all_values)), "Repeated candidate"
        assert set(all_values) <= values, "Unknown candidate"
        ballots.append({"RankGroups": groups, "Rejected": rejected})
    assert len(ids) == len(set(ids)), "Duplicate response"
    with Path(csv_path).open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    assert len(rows) == len(ballots)
    by_id = dict(zip(ids, ballots))
    assert {r["response_id"] for r in rows} == set(ids)
    for row in rows:
        assert json.loads(row[question["Prompt"]]) == by_id[row["response_id"]], "CSV/JSON mismatch"

    # Sort by vote content, not submission order. Local sequential numbers are not source IDs.
    ballots.sort(key=lambda b: json.dumps(b, sort_keys=True))
    data = {
        "title": source["Title"], "exportDate": "2026-09-18",
        "method": question["RankedSettings"]["OfficialMethod"],
        "privacy": "Ballot contents only. Response IDs, submission order, timestamps, language, input method and confirmation answers removed.",
        "options": [{"id": o["Value"], "label": o["Label"]} for o in options],
        "ballots": [{"number": i + 1, "groups": b["RankGroups"], "rejected": b["Rejected"]}
                    for i, b in enumerate(ballots)],
    }
    out = Path(__file__).resolve().parents[1] / "data/event-dates-2027-vote"
    out.mkdir(parents=True, exist_ok=True)
    (out / "ballots.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    csv_file = io.StringIO(newline="")
    writer = csv.writer(csv_file, lineterminator="\n")
    writer.writerow(["ballot_number", "rank_groups", "rejected"])
    for ballot in data["ballots"]:
        writer.writerow([ballot["number"], json.dumps(ballot["groups"]), json.dumps(ballot["rejected"])])
    (out / "ballots.csv").write_text(csv_file.getvalue())
    print(f"Validated {len(ballots)} matching ballots; wrote public JSON and CSV.")


if __name__ == "__main__":
    build(*sys.argv[1:])
