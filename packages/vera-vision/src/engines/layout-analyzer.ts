import type { OcrResult } from "../types";

export type LayoutAnalysis = {
  sections: string[];
  formFields: string[];
  tables: string[][];
};

export class DocumentLayoutAnalyzer {
  analyze(ocr: OcrResult): LayoutAnalysis {
    const lines = ocr.fullText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const sections: string[] = [];
    const formFields: string[] = [];
    const tables: string[][] = [];

    let currentTable: string[] = [];
    for (const line of lines) {
      if (/^[A-Z][A-Z\s]{3,}$/.test(line) && line.length < 60) {
        sections.push(line);
        continue;
      }
      const kv = line.match(/^([^:]{2,40}):\s*(.+)$/);
      if (kv) {
        formFields.push(kv[1]!.trim());
        continue;
      }
      if (line.includes("\t") || /\s{2,}/.test(line)) {
        currentTable.push(line);
      } else if (currentTable.length) {
        tables.push(currentTable);
        currentTable = [];
      }
    }
    if (currentTable.length) tables.push(currentTable);

    return { sections, formFields, tables };
  }
}
