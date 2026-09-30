import type { ExtractedField, MappingCandidate } from "../types";
export declare class AutoValidationEngine {
    validate(documentType: string, fields: ExtractedField[], mappings: MappingCandidate[]): {
        valid: boolean;
        issues: string[];
        standards: string[];
    };
}
//# sourceMappingURL=auto-validation.d.ts.map