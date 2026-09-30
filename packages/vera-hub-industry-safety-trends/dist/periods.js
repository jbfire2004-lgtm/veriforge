"use strict";
/** Period parsing & expansion for trend series */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePeriod = parsePeriod;
exports.periodSortKey = periodSortKey;
exports.sortPeriods = sortPeriods;
exports.monthBucket = monthBucket;
exports.expandTrailingPeriods = expandTrailingPeriods;
exports.nextPeriod = nextPeriod;
exports.horizonSteps = horizonSteps;
const MONTH_RE = /^(\d{4})-(\d{2})$/;
const QUARTER_RE = /^(\d{4})-Q([1-4])$/;
function parsePeriod(period) {
    const m = MONTH_RE.exec(period);
    if (m) {
        const year = Number(m[1]);
        const month = Number(m[2]);
        if (month < 1 || month > 12)
            return null;
        return { kind: "month", year, month };
    }
    const q = QUARTER_RE.exec(period);
    if (q) {
        return { kind: "quarter", year: Number(q[1]), quarter: Number(q[2]) };
    }
    return null;
}
function periodSortKey(period) {
    const p = parsePeriod(period);
    if (!p)
        return Number.POSITIVE_INFINITY;
    if (p.kind === "month")
        return p.year * 12 + (p.month - 1);
    return p.year * 12 + (p.quarter - 1) * 3;
}
function sortPeriods(periods) {
    return [...periods].sort((a, b) => periodSortKey(a) - periodSortKey(b));
}
function monthBucket(period) {
    const p = parsePeriod(period);
    if (!p)
        return null;
    if (p.kind === "month")
        return String(p.month).padStart(2, "0");
    return `Q${p.quarter}`;
}
/** Expand anchor period into trailing window (inclusive). */
function expandTrailingPeriods(anchor, count) {
    const p = parsePeriod(anchor);
    if (!p || count < 1)
        return [];
    const out = [];
    if (p.kind === "month") {
        let y = p.year;
        let m = p.month;
        for (let i = 0; i < count; i++) {
            out.unshift(`${y}-${String(m).padStart(2, "0")}`);
            m -= 1;
            if (m < 1) {
                m = 12;
                y -= 1;
            }
        }
        return out;
    }
    let y = p.year;
    let q = p.quarter;
    for (let i = 0; i < count; i++) {
        out.unshift(`${y}-Q${q}`);
        q -= 1;
        if (q < 1) {
            q = 4;
            y -= 1;
        }
    }
    return out;
}
function nextPeriod(period) {
    const p = parsePeriod(period);
    if (!p)
        return null;
    if (p.kind === "month") {
        let y = p.year;
        let m = p.month + 1;
        if (m > 12) {
            m = 1;
            y += 1;
        }
        return `${y}-${String(m).padStart(2, "0")}`;
    }
    let y = p.year;
    let q = p.quarter + 1;
    if (q > 4) {
        q = 1;
        y += 1;
    }
    return `${y}-Q${q}`;
}
function horizonSteps(horizon, kind) {
    const months = horizon === "1m" ? 1 : horizon === "3m" ? 3 : 6;
    return kind === "month" ? months : Math.max(1, Math.ceil(months / 3));
}
