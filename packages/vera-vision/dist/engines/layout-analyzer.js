"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLayoutAnalyzer = void 0;
class DocumentLayoutAnalyzer {
    analyze(ocr) {
        const lines = ocr.fullText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const sections = [];
        const formFields = [];
        const tables = [];
        let currentTable = [];
        for (const line of lines) {
            if (/^[A-Z][A-Z\s]{3,}$/.test(line) && line.length < 60) {
                sections.push(line);
                continue;
            }
            const kv = line.match(/^([^:]{2,40}):\s*(.+)$/);
            if (kv) {
                formFields.push(kv[1].trim());
                continue;
            }
            if (line.includes("\t") || /\s{2,}/.test(line)) {
                currentTable.push(line);
            }
            else if (currentTable.length) {
                tables.push(currentTable);
                currentTable = [];
            }
        }
        if (currentTable.length)
            tables.push(currentTable);
        return { sections, formFields, tables };
    }
}
exports.DocumentLayoutAnalyzer = DocumentLayoutAnalyzer;
//# sourceMappingURL=layout-analyzer.js.map