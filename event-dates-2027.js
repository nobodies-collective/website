(() => {
    "use strict";

    const escapeHtml = (value) => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    function parseCsv(text) {
        const rows = [];
        let row = [];
        let field = "";
        let quoted = false;

        for (let index = 0; index < text.length; index += 1) {
            const character = text[index];
            const next = text[index + 1];

            if (quoted) {
                if (character === '"' && next === '"') {
                    field += '"';
                    index += 1;
                } else if (character === '"') {
                    quoted = false;
                } else {
                    field += character;
                }
            } else if (character === '"') {
                quoted = true;
            } else if (character === ",") {
                row.push(field);
                field = "";
            } else if (character === "\n") {
                row.push(field.replace(/\r$/, ""));
                rows.push(row);
                row = [];
                field = "";
            } else {
                field += character;
            }
        }

        if (field || row.length) {
            row.push(field.replace(/\r$/, ""));
            rows.push(row);
        }

        const headers = rows.shift();
        return rows
            .filter((values) => values.some(Boolean))
            .map((values) => Object.fromEntries(
                headers.map((header, index) => [header, values[index] ?? ""])
            ));
    }

    const month = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
    const longDate = new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });

    function dateFromIso(value) {
        return new Date(`${value}T00:00:00Z`);
    }

    function weekLabel(row) {
        const start = dateFromIso(row.week_start_2027);
        const end = dateFromIso(row.week_end_2027);
        const text = `${start.getUTCDate()} ${month.format(start)}–${end.getUTCDate()} ${month.format(end)}`;
        return row.week_start_2027 === "2027-07-05"
            ? `${text} <strong>(current slot)</strong>`
            : text;
    }

    function dateList(value) {
        if (!value) return "";
        return value
            .split(" | ")
            .map((date) => longDate.format(dateFromIso(date)))
            .join(", ");
    }

    function tooltipValue(label, note, className = "") {
        const escapedNote = escapeHtml(note);
        const classes = ["tooltip", className].filter(Boolean).join(" ");
        return `<span class="${classes}" tabindex="0" aria-label="${escapedNote}">`
            + `<span>${escapeHtml(label)}</span>`
            + `<span class="tooltip-panel" role="tooltip">${escapedNote}</span>`
            + "</span>";
    }

    function noDataCell(row, year) {
        const futureIn2026 = year === 2026 && row.week_start_2027 >= "2027-08-16";
        const reason = futureIn2026
            ? "No data available yet."
            : "No comparable daily series.";
        return tooltipValue("n/a", reason, "data-na");
    }

    function alertCell(row, year) {
        const available = Number(row[`${year}_days_available`]);
        if (!available) return noDataCell(row, year);

        const levels = ["yellow", "orange", "red", "red_plus"];
        const counts = levels.map((level) => Number(row[`${year}_${level}`]));
        const label = counts.join("/");
        const notes = [];
        const redDates = dateList(row[`${year}_red_dates`]);
        const redPlusDates = dateList(row[`${year}_red_plus_dates`]);
        if (redDates) notes.push(`Red: ${redDates}`);
        if (redPlusDates) notes.push(`Red Plus: ${redPlusDates}`);

        const partial = available < 7 ? ` <small>(${available}/7 days)</small>` : "";
        if (!notes.length) return `<span class="alert-counts">${label}</span>${partial}`;

        return tooltipValue(label, notes.join("; "), "alert-counts") + partial;
    }

    function envelopeCell(row) {
        const available = Number(row["2026_operating_envelope_days_available"]);
        const envelopeStart = row["2026_operating_envelope_start"];
        const envelopeEnd = row["2026_operating_envelope_end"];
        const range = `${longDate.format(dateFromIso(envelopeStart))}–${longDate.format(dateFromIso(envelopeEnd))}`;
        const estimateComplete = Number(
            row["2026_operating_envelope_estimate_complete"]
        );
        if (!estimateComplete) {
            return tooltipValue(
                "n/a",
                `No complete comparable daily series is available for ${range}.`,
                "data-na"
            );
        }
        const estimated = Number(row["2026_operating_envelope_estimated"]);
        const red = Number(
            estimated
                ? row["2026_operating_envelope_estimated_red"]
                : row["2026_operating_envelope_red"]
        );
        const redPlus = Number(
            estimated
                ? row["2026_operating_envelope_estimated_red_plus"]
                : row["2026_operating_envelope_red_plus"]
        );
        const proxyDays = Number(row["2026_operating_envelope_proxy_days"]);
        const outsideSeasonDays = Number(
            row["2026_operating_envelope_outside_season_days"]
        );
        let note = `${range}: ${red} Red and ${redPlus} Red Plus days.`;
        if (estimated) {
            const proxyLabel = proxyDays === 1 ? "day" : "days";
            note += ` Estimate uses ${available} actual 2026 days and `
                + `${proxyDays} matching calendar ${proxyLabel} from 2025.`;
        } else {
            note += " All alert days use the published 2026 record.";
        }
        if (outsideSeasonDays) {
            note += ` ${outsideSeasonDays} days after 15 October fall outside `
                + "the regular fire-danger season.";
        }
        const estimateLabel = estimated ? " Est" : "";
        return tooltipValue(
            `${red + redPlus} days (${redPlus} R+)${estimateLabel}`,
            note,
            "alert-counts"
        );
    }

    function renderNapif(rows) {
        const body = document.querySelector("#napif-weekly-body");
        if (!body) return;
        const weeklyRows = rows.map((row) => {
            const current = row.week_start_2027 === "2027-07-05" ? ' class="is-current"' : "";
            return `<tr${current}>`
                + `<td>${weekLabel(row)}</td>`
                + `<td>${alertCell(row, 2023)}</td>`
                + `<td>${alertCell(row, 2024)}</td>`
                + `<td>${alertCell(row, 2025)}</td>`
                + `<td>${alertCell(row, 2026)}</td>`
                + `<td class="wrap">${envelopeCell(row)}</td>`
                + "</tr>";
        }).join("");

        const levels = ["yellow", "orange", "red", "red_plus"];
        const totalCell = (year) => levels
            .map((level) => rows.reduce(
                (total, row) => total + Number(row[`${year}_${level}`]),
                0
            ))
            .join("/");
        const totals = `<tr class="total-row">`
            + "<td><strong>Total published days</strong></td>"
            + `<td><span class="alert-counts">${totalCell(2023)}</span></td>`
            + `<td><span class="alert-counts">${totalCell(2024)}</span></td>`
            + `<td><span class="alert-counts">${totalCell(2025)}</span></td>`
            + `<td><span class="alert-counts">${totalCell(2026)}</span></td>`
            + '<td aria-label="Not applicable"></td>'
            + "</tr>";
        body.innerHTML = weeklyRows + totals;
    }

    function labelResponsiveTables() {
        document.querySelectorAll(".research-table").forEach((table) => {
            const headers = [...table.querySelectorAll("thead th")]
                .map((header) => header.innerText.replace(/\s+/g, " ").trim());
            table.querySelectorAll("tbody tr").forEach((row) => {
                let column = 0;
                [...row.children].forEach((cell) => {
                    if (!(cell instanceof HTMLTableCellElement)) return;
                    const span = Number(cell.getAttribute("colspan") || 1);
                    const label = headers.slice(column, column + span).filter(Boolean).join(" / ");
                    cell.dataset.label = label;
                    column += span;
                });
            });
        });
    }

    const chartColors = {
        yellow: "#d4a72c",
        orange: "#dd6b20",
        red: "#c53030",
        red_plus: "#701a1a",
        unavailable: "#cbd5e1",
    };

    function chartTicks(maximum, count = 5) {
        const roughStep = maximum / count;
        const magnitude = 10 ** Math.floor(Math.log10(Math.max(roughStep, 1)));
        const normalized = roughStep / magnitude;
        const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
        const step = multiplier * magnitude;
        const ceiling = Math.ceil(maximum / step) * step;
        const ticks = [];
        for (let value = 0; value <= ceiling; value += step) ticks.push(value);
        return { ceiling, ticks };
    }

    function gridMarkup(ticks, ceiling, left, top, plotWidth, plotHeight) {
        return ticks.map((value) => {
            const y = top + plotHeight - (value / ceiling) * plotHeight;
            return `<line class="grid-line" x1="${left}" y1="${y}" x2="${left + plotWidth}" y2="${y}"></line>`
                + `<text x="${left - 10}" y="${y + 4}" text-anchor="end">${value}</text>`;
        }).join("");
    }

    function renderTotalChart(rows) {
        const target = document.querySelector("#napif-total-chart");
        if (!target) return;

        const years = [2023, 2024, 2025, 2026];
        const levels = [
            ["yellow", "Yellow"],
            ["orange", "Orange"],
            ["red", "Red"],
            ["red_plus", "Red Plus"],
        ];
        const totals = years.map((year) => Object.fromEntries(levels.map(([level]) => [
            level,
            rows.reduce((sum, row) => sum + Number(row[`${year}_${level}`]), 0),
        ])));
        const largest = Math.max(...totals.flatMap((total) => levels.map(([level]) => total[level])));
        const { ceiling, ticks } = chartTicks(largest);
        const width = Math.max(300, Math.round(target.clientWidth || 820));
        const height = Math.max(300, Math.min(430, Math.round(width * 0.55)));
        const margin = {
            top: 20,
            right: width < 480 ? 8 : 20,
            bottom: 68,
            left: width < 480 ? 38 : 52,
        };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        const groupWidth = plotWidth / years.length;
        const gap = width < 480 ? 3 : 8;
        const barWidth = Math.max(4, Math.min(32, (groupWidth - 10 - gap * 3) / 4));
        const barsWidth = barWidth * 4 + gap * 3;

        const bars = years.map((year, yearIndex) => {
            const groupLeft = margin.left + yearIndex * groupWidth + (groupWidth - barsWidth) / 2;
            const yearClass = year === 2026 ? ' class="is-partial"' : "";
            const columns = levels.map(([level, label], levelIndex) => {
                const value = totals[yearIndex][level];
                const barHeight = (value / ceiling) * plotHeight;
                const x = groupLeft + levelIndex * (barWidth + gap);
                const y = margin.top + plotHeight - barHeight;
                const coverage = year === 2026 ? " (partial through 10 August)" : "";
                return `<g${yearClass}>`
                    + `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="2" fill="${chartColors[level]}">`
                    + `<title>${year} ${label}: ${value} days${coverage}</title></rect>`
                    + `<text class="value-label" x="${x + barWidth / 2}" y="${Math.max(y - 6, 12)}" text-anchor="middle">${value}</text>`
                    + "</g>";
            }).join("");
            const yearLabel = year === 2026 ? "2026*" : year;
            return columns
                + `<text class="axis-label" x="${margin.left + yearIndex * groupWidth + groupWidth / 2}" y="${height - 35}" text-anchor="middle">${yearLabel}</text>`;
        }).join("");

        target.innerHTML = `<svg class="evidence-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="napif-total-title napif-total-desc">`
            + '<title id="napif-total-title">Alert-day totals by year and alert level</title>'
            + '<desc id="napif-total-desc">Grouped bar chart comparing Yellow, Orange, Red and Red Plus day totals for 2023 through 2026. The 2026 figures are partial through 10 August.</desc>'
            + gridMarkup(ticks, ceiling, margin.left, margin.top, plotWidth, plotHeight)
            + `<line class="axis-line" x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${margin.left + plotWidth}" y2="${margin.top + plotHeight}"></line>`
            + `<text class="axis-label" x="15" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 15 ${margin.top + plotHeight / 2})">Published days</text>`
            + bars
            + `<text x="${width - margin.right}" y="${height - 10}" text-anchor="end">* through 10 Aug</text>`
            + "</svg>";
    }

    function weeklyCumulative(rows) {
        const years = [2023, 2024, 2025, 2026];
        const selected = rows.filter((row) => (
            row.week_start_2027 >= "2027-05-31"
            && row.week_start_2027 <= "2027-08-16"
        ));
        const running = Object.fromEntries(years.map((year) => [
            year,
            { red: 0, red_plus: 0 },
        ]));
        const cumulative = selected.map((row) => ({
            row,
            values: Object.fromEntries(years.map((year) => {
                const available = Number(row[`${year}_days_available`]);
                if (available) {
                    running[year].red += Number(row[`${year}_red`]);
                    running[year].red_plus += Number(row[`${year}_red_plus`]);
                }
                return [year, {
                    available,
                    red: running[year].red,
                    red_plus: running[year].red_plus,
                }];
            })),
        }));
        return { years, cumulative };
    }

    function renderWeeklyMobile(target, years, cumulative, ceiling, ticks) {
        const width = Math.max(280, Math.round(target.clientWidth || 360));
        const margin = { top: 28, right: 12, bottom: 45, left: 42 };
        const labelWidth = 48;
        const groupHeight = 104;
        const plotLeft = margin.left + labelWidth;
        const plotWidth = width - plotLeft - margin.right;
        const plotHeight = cumulative.length * groupHeight;
        const height = margin.top + plotHeight + margin.bottom;

        const verticalGrid = ticks.map((value) => {
            const x = plotLeft + (value / ceiling) * plotWidth;
            return `<line class="grid-line" x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotHeight}"></line>`
                + `<text x="${x}" y="16" text-anchor="middle">${value}</text>`;
        }).join("");

        const groups = cumulative.map(({ row, values }, weekIndex) => {
            const top = margin.top + weekIndex * groupHeight;
            const start = dateFromIso(row.week_start_2027);
            const week = `${start.getUTCDate()} ${month.format(start)}`;
            const separator = weekIndex
                ? `<line class="grid-line" x1="${margin.left}" y1="${top}" x2="${width - margin.right}" y2="${top}"></line>`
                : "";
            const bars = years.map((year, yearIndex) => {
                const value = values[year];
                const y = top + 24 + yearIndex * 18;
                if (!value.available) {
                    return `<text x="${margin.left}" y="${y + 10}" text-anchor="start">${String(year).slice(2)}</text>`
                        + `<rect class="is-partial" x="${plotLeft}" y="${y}" width="18" height="11" rx="2" fill="${chartColors.unavailable}">`
                        + `<title>${year}: no data available yet for this week</title></rect>`
                        + `<text x="${plotLeft + 23}" y="${y + 10}">n/a</text>`;
                }
                const redWidth = (value.red / ceiling) * plotWidth;
                const redPlusWidth = (value.red_plus / ceiling) * plotWidth;
                const partial = year === 2026 && value.available < 7;
                const partialClass = partial ? ' class="is-partial"' : "";
                const note = partial ? `; partial week (${value.available}/7 days)` : "";
                const total = value.red + value.red_plus;
                const totalLabel = total
                    ? `<text class="value-label" x="${Math.min(plotLeft + redWidth + redPlusWidth + 5, width - 10)}" y="${y + 10}">${total}</text>`
                    : "";
                return `<g${partialClass}>`
                    + `<text x="${margin.left}" y="${y + 10}" text-anchor="start">${String(year).slice(2)}</text>`
                    + `<rect x="${plotLeft}" y="${y}" width="${redWidth}" height="11" fill="${chartColors.red}">`
                    + `<title>${year}: ${value.red} cumulative Red days${note}</title></rect>`
                    + `<rect x="${plotLeft + redWidth}" y="${y}" width="${redPlusWidth}" height="11" fill="${chartColors.red_plus}">`
                    + `<title>${year}: ${value.red_plus} cumulative Red Plus days${note}</title></rect>`
                    + totalLabel
                    + "</g>";
            }).join("");
            return separator
                + `<text class="axis-label" x="${margin.left}" y="${top + 15}">${week}</text>`
                + bars;
        }).join("");

        target.innerHTML = `<svg class="evidence-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="napif-week-title napif-week-desc">`
            + '<title id="napif-week-title">Cumulative Red and Red Plus alert days by week and year</title>'
            + '<desc id="napif-week-desc">Horizontal grouped stacked bars show the running total of Red and Red Plus days from 1 June through each candidate week, for 2023 through 2026.</desc>'
            + verticalGrid
            + groups
            + `<text x="${margin.left}" y="${height - 12}">Years shown as 23 / 24 / 25 / 26</text>`
            + "</svg>";
    }

    function renderWeeklyDesktop(target, years, cumulative, ceiling, ticks) {
        const width = Math.max(700, Math.round(target.clientWidth || 1100));
        const height = Math.max(390, Math.min(480, Math.round(width * 0.42)));
        const margin = { top: 20, right: 20, bottom: 105, left: 52 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        const groupWidth = plotWidth / cumulative.length;
        const gap = 3;
        const barWidth = Math.max(6, Math.min(17, (groupWidth - 8 - gap * 3) / 4));
        const barsWidth = barWidth * 4 + gap * 3;

        const groups = cumulative.map(({ row, values }, weekIndex) => {
            const groupLeft = margin.left + weekIndex * groupWidth + (groupWidth - barsWidth) / 2;
            const columns = years.map((year, yearIndex) => {
                const value = values[year];
                const x = groupLeft + yearIndex * (barWidth + gap);
                if (!value.available) {
                    return `<g class="is-partial">`
                        + `<rect x="${x}" y="${margin.top + plotHeight - 12}" width="${barWidth}" height="12" rx="2" fill="${chartColors.unavailable}">`
                        + `<title>${year}: no data available yet for this week</title></rect>`
                        + "</g>";
                }
                const redHeight = (value.red / ceiling) * plotHeight;
                const redPlusHeight = (value.red_plus / ceiling) * plotHeight;
                const baseY = margin.top + plotHeight;
                const partial = year === 2026 && value.available < 7;
                const partialClass = partial ? ' class="is-partial"' : "";
                const note = partial ? `; partial week (${value.available}/7 days)` : "";
                const total = value.red + value.red_plus;
                const valueLabel = total
                    ? `<text class="value-label" x="${x + barWidth / 2}" y="${Math.max(baseY - redHeight - redPlusHeight - 5, 12)}" text-anchor="middle">${total}</text>`
                    : "";
                return `<g${partialClass}>`
                    + `<rect x="${x}" y="${baseY - redHeight}" width="${barWidth}" height="${redHeight}" fill="${chartColors.red}">`
                    + `<title>${year}: ${value.red} cumulative Red days${note}</title></rect>`
                    + `<rect x="${x}" y="${baseY - redHeight - redPlusHeight}" width="${barWidth}" height="${redPlusHeight}" fill="${chartColors.red_plus}">`
                    + `<title>${year}: ${value.red_plus} cumulative Red Plus days${note}</title></rect>`
                    + valueLabel
                    + "</g>";
            }).join("");
            const start = dateFromIso(row.week_start_2027);
            const label = `${start.getUTCDate()} ${month.format(start)}`;
            const center = margin.left + weekIndex * groupWidth + groupWidth / 2;
            const yearLabels = years.map((year, yearIndex) => (
                `<text x="${groupLeft + yearIndex * (barWidth + gap) + barWidth / 2}" y="${height - 72}" text-anchor="middle">${String(year).slice(2)}</text>`
            )).join("");
            return columns + yearLabels
                + `<text class="axis-label" x="${center}" y="${height - 43}" text-anchor="middle">${label}</text>`;
        }).join("");

        target.innerHTML = `<svg class="evidence-chart wide" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="napif-week-title napif-week-desc">`
            + '<title id="napif-week-title">Cumulative Red and Red Plus alert days by week and year</title>'
            + '<desc id="napif-week-desc">Grouped stacked columns show the running total of Red and Red Plus days from 1 June through each candidate week, for 2023 through 2026.</desc>'
            + gridMarkup(ticks, ceiling, margin.left, margin.top, plotWidth, plotHeight)
            + `<line class="axis-line" x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${margin.left + plotWidth}" y2="${margin.top + plotHeight}"></line>`
            + `<text class="axis-label" x="15" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 15 ${margin.top + plotHeight / 2})">Cumulative alert days</text>`
            + groups
            + `<text x="${margin.left}" y="${height - 10}">Small labels identify year: 23 / 24 / 25 / 26</text>`
            + "</svg>";
    }

    function renderWeeklyChart(rows) {
        const target = document.querySelector("#napif-week-chart");
        if (!target) return;
        const { years, cumulative } = weeklyCumulative(rows);
        const largest = Math.max(...cumulative.flatMap(({ values }) => years.map(
            (year) => values[year].available ? values[year].red + values[year].red_plus : 0
        )));
        const { ceiling, ticks } = chartTicks(largest);
        if (target.clientWidth < 700) {
            renderWeeklyMobile(target, years, cumulative, ceiling, ticks);
        } else {
            renderWeeklyDesktop(target, years, cumulative, ceiling, ticks);
        }
    }

    function renderClimate(rows) {
        const heatBody = document.querySelector("#climate-heat-body");
        const rainBody = document.querySelector("#climate-rain-body");
        if (!heatBody || !rainBody) return;

        heatBody.innerHTML = rows.map((row) => {
            const current = row.week_start_2027 === "2027-07-05" ? ' class="is-current"' : "";
            return `<tr${current}>`
                + `<td>${weekLabel(row)}</td>`
                + `<td>${escapeHtml(row.median_daily_high_c)}°C</td>`
                + `<td>${escapeHtml(row.p95_daily_high_c)}°C</td>`
                + `<td>${escapeHtml(row.median_daily_low_c)}°C</td>`
                + `<td>${escapeHtml(row.p05_daily_low_c)}°C</td>`
                + `<td>${escapeHtml(row.mean_days_at_or_above_35c)}</td>`
                + `<td>${escapeHtml(row.mean_nights_at_or_above_20c)}</td>`
                + "</tr>";
        }).join("");

        rainBody.innerHTML = rows.map((row) => {
            const current = row.week_start_2027 === "2027-07-05" ? ' class="is-current"' : "";
            return `<tr${current}>`
                + `<td>${weekLabel(row)}</td>`
                + `<td>${escapeHtml(row.wet_day_probability_pct)}%</td>`
                + `<td>${escapeHtml(row.years_with_wet_week_pct)}%</td>`
                + `<td>${escapeHtml(row.mean_weekly_rain_mm)} mm</td>`
                + `<td>${escapeHtml(row.p90_weekly_rain_mm)} mm</td>`
                + "</tr>";
        }).join("");
    }

    function showLoadError(selector) {
        const body = document.querySelector(selector);
        if (body) {
            body.innerHTML = '<tr><td colspan="10">The evidence CSV could not be loaded. Use the download link above to inspect it directly.</td></tr>';
        }
    }

    Promise.all([
        fetch("/data/event-dates-2027/napif-weekly.csv").then((response) => {
            if (!response.ok) throw new Error(`NAPIF CSV: ${response.status}`);
            return response.text();
        }),
        fetch("/data/event-dates-2027/climate-weekly.csv").then((response) => {
            if (!response.ok) throw new Error(`Climate CSV: ${response.status}`);
            return response.text();
        }),
    ]).then(([napif, climate]) => {
        const napifRows = parseCsv(napif);
        renderNapif(napifRows);
        labelResponsiveTables();
        renderTotalChart(napifRows);
        renderWeeklyChart(napifRows);
        renderClimate(parseCsv(climate));
        labelResponsiveTables();

        let resizeTimer;
        let previousWidth = document.querySelector("#napif-total-chart")?.clientWidth;
        window.addEventListener("resize", () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                const width = document.querySelector("#napif-total-chart")?.clientWidth;
                if (!width || width === previousWidth) return;
                previousWidth = width;
                renderTotalChart(napifRows);
                renderWeeklyChart(napifRows);
            }, 120);
        });
    }).catch((error) => {
        console.error(error);
        showLoadError("#napif-weekly-body");
        showLoadError("#climate-heat-body");
        showLoadError("#climate-rain-body");
        const totalChart = document.querySelector("#napif-total-chart");
        const weekChart = document.querySelector("#napif-week-chart");
        if (totalChart) totalChart.textContent = "The alert chart data could not be loaded.";
        if (weekChart) weekChart.textContent = "The alert chart data could not be loaded.";
    });
})();
