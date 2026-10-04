import { Injectable } from '@nestjs/common';
import type { SafetyProgramExtract } from './schema/safety-program-extract.schema';

export type SafetyProgramSummaries = {
  document_summary: string;
  hazard_summaries: Array<{ hazard_id: string; summary: string }>;
  control_summaries: Array<{ control_id: string; summary: string }>;
};

@Injectable()
export class SafetyProgramSummarizeService {
  summarize(doc: SafetyProgramExtract): SafetyProgramSummaries {
    if (!doc.meta.is_safety_document) {
      return {
        document_summary: '',
        hazard_summaries: [],
        control_summaries: [],
      };
    }

    const title = doc.meta.document_title ?? 'Untitled safety document';
    const dtype = doc.meta.document_type ?? 'safety document';
    const jur = doc.meta.jurisdiction
      ? ` Jurisdiction: ${doc.meta.jurisdiction}.`
      : '';
    const regs = doc.meta.regulatory_frameworks.length
      ? ` Key references: ${doc.meta.regulatory_frameworks.slice(0, 6).join(', ')}.`
      : '';
    const hazardBits = doc.hazards
      .slice(0, 5)
      .map((h) => h.description)
      .join('; ');
    const controlBits = doc.controls
      .slice(0, 5)
      .map((c) => c.description)
      .join('; ');
    const procBits = doc.procedures
      .slice(0, 3)
      .map((p) => p.name)
      .join('; ');

    const sentences: string[] = [
      `This ${dtype} (“${title}”) covers safety requirements for the stated scope.`,
    ];
    if (hazardBits) {
      sentences.push(`Primary hazards include: ${hazardBits}.`);
    }
    if (controlBits) {
      sentences.push(`Key controls include: ${controlBits}.`);
    }
    if (procBits) {
      sentences.push(`Main procedures referenced: ${procBits}.`);
    }
    sentences.push(`${jur}${regs}`.trim() || 'Regulatory references were not stated in the extract.');
    if (doc.ppe.length) {
      sentences.push(
        `PPE items called out: ${doc.ppe
          .slice(0, 5)
          .map((p) => p.item)
          .join('; ')}.`,
      );
    }

    return {
      document_summary: sentences.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
      hazard_summaries: doc.hazards.map((h) => ({
        hazard_id: h.id,
        summary: [
          h.description,
          h.category_normalized || h.category
            ? `Category: ${h.category_normalized ?? h.category}.`
            : '',
          h.severity ? `Severity noted as ${h.severity}.` : '',
          h.likelihood ? `Likelihood noted as ${h.likelihood}.` : '',
          h.regulatory_references.length
            ? `References: ${h.regulatory_references.join(', ')}.`
            : '',
          relatedControls(doc, h.id),
        ]
          .filter(Boolean)
          .join(' ')
          .trim(),
      })),
      control_summaries: doc.controls.map((c) => ({
        control_id: c.id,
        summary: [
          c.description,
          `Applies as a ${(c.type_normalized ?? c.type ?? 'control').toString()} control.`,
          c.hierarchy_level_normalized || c.hierarchy_level
            ? `Hierarchy: ${c.hierarchy_level_normalized ?? c.hierarchy_level}.`
            : '',
          c.required === true ? 'Marked as required.' : '',
          c.regulatory_references.length
            ? `References: ${c.regulatory_references.join(', ')}.`
            : '',
        ]
          .filter(Boolean)
          .join(' ')
          .trim(),
      })),
    };
  }
}

function relatedControls(doc: SafetyProgramExtract, hazardId: string): string {
  const related = doc.controls.filter((c) =>
    c.related_hazards.includes(hazardId),
  );
  if (!related.length) return '';
  return `Related controls: ${related
    .slice(0, 3)
    .map((c) => c.description)
    .join('; ')}.`;
}
