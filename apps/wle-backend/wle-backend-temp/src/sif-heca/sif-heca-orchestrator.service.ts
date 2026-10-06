import { Injectable } from '@nestjs/common';
import { SifHecaService } from './sif-heca.service';

export type VeraOrchestratorSection = {
  facts: string[];
  analysis: string[];
  actions: string[];
};

@Injectable()
export class SifHecaOrchestratorService {
  constructor(private readonly sifHeca: SifHecaService) {}

  async analyzeEvent(
    eventId: string,
  ): Promise<
    VeraOrchestratorSection & { moduleType: string; recordId: string }
  > {
    const event = await this.sifHeca.getEvent(eventId);
    const raw = (event.rawPayload ?? {}) as {
      assessmentKind?: string;
      hazards?: Array<{
        description: string;
        severity?: number;
        likelihood?: number;
      }>;
      jobDescription?: string;
      workScope?: string;
      locationNote?: string;
      source?: string;
    };

    const sif = event.sifScore;
    const heca = event.hecaScore;
    const capa = event.correctiveActions ?? [];

    const facts: string[] = [
      `SIF/HECA event · ${event.status} · project #${event.projectId}`,
      `Title: ${event.title}`,
      event.description
        ? `Description: ${event.description}`
        : 'Description: not recorded',
      `Source: ${event.sourceType} / ${event.sourceId}`,
      raw.source === 'field_offline'
        ? 'Captured via field offline sync'
        : 'Captured via PM workflow',
    ];

    if (raw.locationNote) facts.push(`Location: ${raw.locationNote}`);
    if (raw.hazards?.length) {
      facts.push(`${raw.hazards.length} hazard(s) documented in payload`);
    } else {
      facts.push('Hazards: not structured in payload — scope text only');
    }

    const missing: string[] = [];
    if (!event.description?.trim()) missing.push('Work description');
    if (!sif) missing.push('SIF score not computed');
    if (!heca) missing.push('HECA classification not computed');
    if (missing.length) facts.push(`Missing: ${missing.join('; ')}`);

    const analysis: string[] = [];
    if (sif) {
      analysis.push(
        `SIF score ${sif.sifScore} — category ${sif.sifCategory}${
          sif.requiresSupervisorReview ? ' · SUPERVISOR REVIEW REQUIRED' : ''
        }`,
      );
      if (sif.sifCategory === 'critical' || sif.sifCategory === 'high') {
        analysis.push(
          'SIF POTENTIAL — life-critical risk profile. Stop work until controls verified.',
        );
      }
      const explain =
        (sif.explainability as Array<{ detail: string; points: number }>) ?? [];
      for (const row of explain.slice(0, 5)) {
        analysis.push(row.detail);
      }
      const requiredControls = (sif.requiredControls as string[]) ?? [];
      if (requiredControls.length) {
        analysis.push(`Required controls: ${requiredControls.join('; ')}`);
      }
    }

    if (heca) {
      analysis.push(
        `HECA: ${heca.hecaCategoryLabel} — risk ${heca.hecaRiskScore}${
          heca.highEnergyFlag ? ' · HIGH ENERGY' : ''
        }`,
      );
      if (heca.highEnergyFlag) {
        analysis.push(
          'High-energy hazard — direct controls and isolation required; PPE-only is insufficient.',
        );
      }
      const requiredCorrective = (heca.requiredCorrective as string[]) ?? [];
      if (requiredCorrective.length) {
        analysis.push(
          `HECA corrective needs: ${requiredCorrective.join('; ')}`,
        );
      }
    }

    if (analysis.length === 0) {
      analysis.push(
        'Event ingested but not fully scored — re-run evaluation from PM or re-sync from field.',
      );
    }

    const actions: string[] = [];
    if (event.status === 'review_required') {
      actions.push(
        'Supervisor/HSE: review SIF score and HECA classification — approve, reject, or request changes.',
      );
    }
    if (sif?.requiresSupervisorReview) {
      actions.push(
        'Do not authorize work until supervisor approval is recorded.',
      );
    }
    if (capa.length) {
      actions.push(
        `${capa.length} corrective action(s) linked — verify closure and evidence.`,
      );
    }
    for (const c of capa.slice(0, 3)) {
      actions.push(`CAPA: ${c.title} (${c.status})`);
    }
    actions.push(
      'Verify energy isolation and direct controls in the field before work.',
    );
    actions.push(
      'Escalate to HSE if SIF category is high or critical and controls cannot be verified.',
    );

    const moduleType =
      raw.assessmentKind === 'HECA'
        ? 'HECA'
        : raw.assessmentKind === 'SIF'
        ? 'SIF'
        : 'SIF/HECA';

    return {
      moduleType,
      recordId: eventId,
      facts,
      analysis,
      actions,
    };
  }
}
