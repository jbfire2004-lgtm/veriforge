import type { OcrResult } from "../types";
export type LayoutAnalysis = {
    sections: string[];
    formFields: string[];
    tables: string[][];
};
export declare class DocumentLayoutAnalyzer {
    analyze(ocr: OcrResult): LayoutAnalysis;
}
//# sourceMappingURL=layout-analyzer.d.ts.map