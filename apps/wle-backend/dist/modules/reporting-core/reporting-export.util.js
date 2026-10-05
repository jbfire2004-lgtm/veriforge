"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeCsvCell = escapeCsvCell;
exports.toCsv = toCsv;
function escapeCsvCell(value) {
    if (value == null)
        return '';
    const s = value instanceof Date ? value.toISOString() : String(value);
    if (/[",\n\r]/.test(s))
        return `"${s.replace(/"/g, '""')}"`;
    return s;
}
function toCsv(headers, rows) {
    const lines = [
        headers.map(escapeCsvCell).join(','),
        ...rows.map((row) => row.map(escapeCsvCell).join(',')),
    ];
    return lines.join('\r\n');
}
//# sourceMappingURL=reporting-export.util.js.map