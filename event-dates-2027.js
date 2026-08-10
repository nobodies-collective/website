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
    const exactAlertDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
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

    function countValues(values) {
        return values.reduce((counts, value) => {
            counts[value] = (counts[value] || 0) + 1;
            return counts;
        }, {});
    }

    function weeklyAlertDays(rows, dailyRows) {
        const years = [2023, 2024, 2025, 2026];
        const dailyByDate = new Map(dailyRows.map((row) => [row.date, row.level]));
        const selected = rows.filter((row) => (
            row.week_start_2027 >= "2027-05-31"
            && row.week_start_2027 <= "2027-08-16"
        ));
        const weekly = selected.map((row) => ({
            row,
            values: Object.fromEntries(years.map((year) => {
                const candidateStart = dateFromIso(row.week_start_2027);
                const days = Array.from({ length: 7 }, (_, offset) => {
                    const candidateDate = new Date(candidateStart);
                    candidateDate.setUTCDate(candidateDate.getUTCDate() + offset);
                    const historicalDate = new Date(Date.UTC(
                        year,
                        candidateDate.getUTCMonth(),
                        candidateDate.getUTCDate()
                    ));
                    const date = historicalDate.toISOString().slice(0, 10);
                    return {
                        date,
                        level: dailyByDate.get(date) || "unavailable",
                    };
                });
                const counts = countValues(days.map((day) => day.level));
                return [year, {
                    days,
                    available: 7 - (counts.unavailable || 0),
                    yellow: counts.yellow || 0,
                    orange: counts.orange || 0,
                    red: counts.red || 0,
                    red_plus: counts.red_plus || 0,
                }];
            })),
        }));
        return { years, weekly };
    }

    function weeklyCell(value, x, y, width, height, compact = false) {
        const padding = 4;
        const gap = 1.5;
        const slotWidth = Math.max(
            2,
            (width - padding * 2 - gap * 6) / 7
        );
        const slotHeight = Math.min(14, height * 0.34);
        const levelLabels = {
            yellow: "Yellow",
            orange: "Orange",
            red: "Red",
            red_plus: "Red Plus",
            unavailable: "No comparable data",
        };
        const slots = value.days.map((day, index) => {
            const detail = `${exactAlertDate.format(dateFromIso(day.date))}: ${levelLabels[day.level]}`;
            return `<rect x="${x + padding + index * (slotWidth + gap)}" y="${y + 8}" `
                + `width="${slotWidth}" height="${slotHeight}" rx="1.5" fill="${chartColors[day.level]}" `
                + `tabindex="0" aria-label="${escapeHtml(detail)}">`
                + `<title>${escapeHtml(detail)}</title>`
                + "</rect>";
        }).join("");
        let label;
        if (!value.available) {
            label = "n/a";
        } else {
            const counts = [
                value.yellow,
                value.orange,
                value.red,
                value.red_plus,
            ];
            label = compact ? counts.join("/") : counts.join(" / ");
        }
        const note = value.available < 7
            ? ` Only ${value.available} of 7 days are available.`
            : "";
        return `<g>`
            + `<title>${value.yellow} Yellow; ${value.orange} Orange; `
            + `${value.red} Red; ${value.red_plus} Red Plus.${note}</title>`
            + `<rect x="${x + 1}" y="${y + 1}" width="${width - 2}" height="${height - 2}" `
            + 'rx="4" fill="rgba(255,255,255,0.18)" stroke="#d8d0c3"></rect>'
            + slots
            + `<text class="value-label" x="${x + width / 2}" y="${y + height - 8}" text-anchor="middle">${label}</text>`
            + "</g>";
    }

    function renderWeeklyMobile(target, years, weekly) {
        const width = Math.max(280, Math.round(target.clientWidth || 360));
        const margin = { top: 34, right: 4, bottom: 10, left: 48 };
        const plotWidth = width - margin.left - margin.right;
        const columnWidth = plotWidth / years.length;
        const rowHeight = 43;
        const height = margin.top + weekly.length * rowHeight + margin.bottom;
        const yearLabels = years.map((year, index) => (
            `<text class="axis-label" x="${margin.left + index * columnWidth + columnWidth / 2}" `
            + 'y="22" text-anchor="middle">'
            + `${year}</text>`
        )).join("");
        const rows = weekly.map(({ row, values }, weekIndex) => {
            const y = margin.top + weekIndex * rowHeight;
            const start = dateFromIso(row.week_start_2027);
            const label = `${start.getUTCDate()} ${month.format(start)}`;
            const cells = years.map((year, yearIndex) => weeklyCell(
                values[year],
                margin.left + yearIndex * columnWidth,
                y,
                columnWidth,
                rowHeight,
                true
            )).join("");
            return `<text class="axis-label" x="${margin.left - 5}" y="${y + rowHeight / 2 + 4}" text-anchor="end">${label}</text>`
                + cells;
        }).join("");
        target.innerHTML = `<svg class="evidence-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="napif-week-title napif-week-desc">`
            + '<title id="napif-week-title">Daily fire-alert levels by week and year</title>'
            + '<desc id="napif-week-desc">A matrix with weeks as rows and years as columns. Each cell has seven chronological slots showing Yellow, Orange, Red, Red Plus, or unavailable days.</desc>'
            + yearLabels
            + rows
            + "</svg>";
    }

    function renderWeeklyDesktop(target, years, weekly) {
        const width = Math.max(700, Math.round(target.clientWidth || 1100));
        const margin = { top: 42, right: 6, bottom: 10, left: 48 };
        const plotWidth = width - margin.left - margin.right;
        const columnWidth = plotWidth / weekly.length;
        const rowHeight = 52;
        const height = margin.top + years.length * rowHeight + margin.bottom;
        const weekLabels = weekly.map(({ row }, weekIndex) => {
            const start = dateFromIso(row.week_start_2027);
            const label = `${start.getUTCDate()} ${month.format(start)}`;
            return `<text class="axis-label" x="${margin.left + weekIndex * columnWidth + columnWidth / 2}" `
                + 'y="25" text-anchor="middle">'
                + `${label}</text>`;
        }).join("");
        const rows = years.map((year, yearIndex) => {
            const y = margin.top + yearIndex * rowHeight;
            const cells = weekly.map(({ values }, weekIndex) => weeklyCell(
                values[year],
                margin.left + weekIndex * columnWidth,
                y,
                columnWidth,
                rowHeight
            )).join("");
            return `<text class="axis-label" x="${margin.left - 7}" y="${y + rowHeight / 2 + 4}" text-anchor="end">${year}</text>`
                + cells;
        }).join("");
        target.innerHTML = `<svg class="evidence-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="napif-week-title napif-week-desc">`
            + '<title id="napif-week-title">Daily fire-alert levels by week and year</title>'
            + '<desc id="napif-week-desc">A matrix with years as rows and weeks as columns. Each cell has seven chronological slots showing Yellow, Orange, Red, Red Plus, or unavailable days.</desc>'
            + weekLabels
            + rows
            + "</svg>";
    }

    function renderWeeklyChart(rows, dailyRows) {
        const target = document.querySelector("#napif-week-chart");
        if (!target) return;
        const { years, weekly } = weeklyAlertDays(rows, dailyRows);
        if (target.clientWidth < 700) {
            renderWeeklyMobile(target, years, weekly);
        } else {
            renderWeeklyDesktop(target, years, weekly);
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
        fetch("/data/event-dates-2027/napif-daily-2023-2026.csv").then((response) => {
            if (!response.ok) throw new Error(`NAPIF daily CSV: ${response.status}`);
            return response.text();
        }),
    ]).then(([napif, climate, napifDaily]) => {
        const napifRows = parseCsv(napif);
        const napifDailyRows = parseCsv(napifDaily);
        renderNapif(napifRows);
        labelResponsiveTables();
        renderTotalChart(napifRows);
        renderWeeklyChart(napifRows, napifDailyRows);
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
                renderWeeklyChart(napifRows, napifDailyRows);
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
