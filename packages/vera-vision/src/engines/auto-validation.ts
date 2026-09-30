import type { ExtractedField, MappingCandidate } from "../types";
import { STANDARD_PATTERNS } from "../utils/patterns";

export class AutoValidationEngine {
  validate(
    documentType: string,
    fields: ExtractedField[],
    mappings: MappingCandidate[]
  ): { valid: boolean; issues: string[]; standards: string[] } {
    const issues: string[] = [];
    const standards: string[] = [];

    for (const f of fields.filter((x) => x.key === "standard")) {
      standards.push(f.value);
    }
    if (standards.length === 0) {
      const text = fields.map((f) => f.value).join(" ");
      for (const s of STANDARD_PATTERNS) {
        if (s.re.test(text)) standards.push(s.code);
      }
    }

    if (documentType === "training_certificate") {
      if (!fields.some((f) => f.key === "workerName")) issues.push("Missing worker name");
      if (!fields.some((f) => f.key === "courseName")) issues.push("Missing course name");
      if (!fields.some((f) => f.key === "expiryDate") && !fields.some((f) => f.key === "issueDate")) {
        issues.push("Missing training dates");
      }
      if (mappings.every((m) => m.entityType !== "worker")) {
        issues.push("Worker could not be auto-mapped");
      }
    }

    if (documentType === "inspection_form") {
      if (!fields.some((f) => f.key === "passFail")) issues.push("Missing pass/fail indication");
    }

    if (documentType === "equipment_plate") {
      if (!fields.some((f) => f.key === "serialNumber")) issues.push("Serial number not detected");
    }

    const expiry = fields.find((f) => f.key === "expiryDate")?.value;
    if (expiry && new Date(expiry) < new Date()) {
      issues.push("Document or training appears expired");
    }

    return { valid: issues.length === 0, issues, standards };
  }
}
