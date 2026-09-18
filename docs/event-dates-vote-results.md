# Asociado vote results

Page: `event-dates-2027-vote-results.html`

This is separate from the 948-response attendee survey results page and is
linked from the event-dates page. Daniel approved publication on 18 September
2026 after local review. The page retains `noindex, nofollow`, consistent with
the other event-date evidence pages, and explicitly distinguishes the vote
result from formal confirmation of event dates.

## Data custody

Input: the JSON and CSV exports for survey
`fd47e6d1-0d14-41e9-8357-da1e95536751`, supplied on 18 September 2026.
There are 97 distinct response IDs and matching ranked answers in both files.
Some candidates are omitted rather than explicitly rejected.

Regenerate the public files:

```sh
python3 scripts/build-event-date-votes.py /path/to/export.json /path/to/export.csv
```

The script validates source agreement, candidate membership, and duplicate
responses/options before writing. Output retains complete rank groups and
rejections but removes response IDs, timestamps, language, input method,
confirmation answers, and original submission order. Sequential ballot numbers
are assigned after sorting by ballot content. No raw export is copied into the
website. Distinctive ballot patterns can still be recognisable; this is
metadata minimisation, not a guarantee of anonymity.

The export date and overview are intentionally snapshot-specific. A new export
requires reviewing the page's summary, descriptions, test fixtures, and count,
not simply replacing the data files.

## Counting provenance

Ported from `src/Sections/Humans.Surveys/Services/RankedChoiceCounter.cs`,
read from Humans `qa/main` at `c654a5680` on 18 September 2026:

- Ranked groups first, omitted candidates tied below ranked groups, explicitly
  rejected candidates tied below omissions.
- Rank-pair victories sorted by margin descending, winning votes descending,
  then original candidate order (winner, then loser).
- Lock victories unless they create a cycle.
- The source candidate wins; finishing order on this page topologically sorts
  the locked graph, falling back to original order only if needed.
- Borda uses averaged occupied-position scores for ties, including separate
  omitted and rejected groups.

Important discrepancy: the older public voting-method explanation describes
omissions and rejections as tied. The implemented rule instead places omissions
above rejections. Following the actual implementation matches every cell of the
provided `results.png`. Combining omissions and rejections would change only
one directed cell: July over 6–12 September is 25 rather than 26. Winner and
finishing order are unchanged. This distinction is disclosed on the new page;
the older method pages have not been silently rewritten.

The full-export winner is 7–13 June, a Condorcet winner. Finishing order:

1. 7–13 June
2. 6–12 September
3. 13–19 September
4. 20–26 September
5. 14–20 June
6. 31 May–6 June
7. 27 September–3 October
8. 5–11 July

There are 27 locked victories and one cycle-skipped victory: 31 May–6 June
over 20–26 September, 45–44. No exact strength or finishing-order tie-break
is needed for the full export.

## Local verification

```sh
node scripts/test-event-date-votes.mjs
python3 -m http.server 8773 --bind 127.0.0.1
# In another terminal, using the existing parent-directory Playwright install:
node scripts/test-event-date-votes-browser.mjs http://127.0.0.1:8773
```

The model tests cover the screenshot matrix, result, cycle, ballot integrity,
all 247 subsets with at least two candidates, and synthetic tied, omitted,
rejected, empty-ranked, and cyclic ballots. Browser tests cover matrix modes,
date focus, table sorting, chart modes and units, ballot filtering/pagination,
scenario recalculation/reset, downloads, loading failures, JavaScript errors,
and document overflow at 320, 390, 768, and 1440 pixels.

The event-dates landing page now leads with the three result cards and links
to the explorer. The previous pack is labelled historical/review material.
The NAPIF record was extended through 18 September from ten new official
reports (2 Red, 4 Orange, 4 Yellow days); the 511 existing records were
preserved. Weekly tables and operating-envelope estimates were regenerated
with `python3 scripts/build-event-date-evidence.py --skip-climate --reuse-daily`.

The distinction from the older method explanation remains disclosed on the
results page; older method pages have not been rewritten. Do not treat the export alone as proof
that voting is closed or that the winning dates are formally confirmed.
