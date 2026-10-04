import { Injectable } from '@nestjs/common';
import { JhaFlhaService } from './jha-flha.service';
import type { JhaEvaluationResult } from './jha-scoring.service';

export type VeraOrchestratorSection = {
  facts: string[];
  analysis: string[];
  actions: string[];
};

@Injectable()
export class JhaFlhaOrchestratorService {
  constructor(private readonly jha: JhaFlhaService) {}

  async analyze(
    id: string,
  ): Promise<
    VeraOrchestratorSection & { moduleType: string; recordId: string }
  > {
    const row = await this.jha.getById(id);
    const evaluation = (await this.jha.evaluate(id)) as JhaEvaluationResult;
    const suggestions = await this.jha.getSuggestions(id);

    const kind = row.kind;
    const hazards = row.hazards ?? [];
    const controls = row.controls ?? [];
    const workers = row.workers ?? [];
    const energySources = row.energySources ?? [];
    const signedWorkers = workers.filter((w) => w.signedAt).length;

    const facts: string[] = [
      `${kind} · status ${row.status} · project #${row.projectId}`,
      `Task: ${row.taskDescription || '—'}`,
      row.locationNote
        ? `Location: ${row.locationNote}`
        : 'Location: not recorded',
      `${hazards.length} hazard(s), ${controls.length} control(s), ${energySources.length} energy source(s)`,
      `Crew: ${workers.length} worker(s), ${signedWorkers} signed`,
      `Risk ${evaluation.riskScore}, quality ${evaluation.qualityScore}, SIF score ${evaluation.sifScore}`,
    ];

    const missing: string[] = [];
    if (!row.taskDescription?.trim()) missing.push('Task description');
    if (hazards.length === 0) missing.push('At least one hazard');
    if (controls.length === 0) missing.push('At least one control');
    if (energySources.length === 0) missing.push('Energy wheel coverage');
    if (workers.length === 0) missing.push('Crew assignment');
    if (workers.length > 0 && signedWorkers < workers.length) {
      missing.push(`${workers.length - signedWorkers} crew signature(s)`);
    }
    if (evaluation.missingControls.length) {
      missing.push(...evaluation.missingControls.map((m) => `Control: ${m}`));
    }
    if (missing.length) {
      facts.push(`Missing: ${missing.join('; ')}`);
    }

    const historical: string[] = [];
    if (suggestions.matchedTaskProfiles?.length) {
      historical.push(
        `Task profiles matched: ${suggestions.matchedTaskProfiles.join(', ')}`,
      );
    }
    const crewAdds = suggestions.crewOftenAdds as
      | {
          hazards?: Array<{ description: string }>;
          controls?: Array<{ description: string }>;
        }
      | undefined;
    const crewAddLines = [
      ...(crewAdds?.hazards?.slice(0, 2).map((h) => h.description) ?? []),
      ...(crewAdds?.controls?.slice(0, 2).map((c) => c.description) ?? []),
    ];
    if (crewAddLines.length) {
      historical.push(
        `Crew often adds on this project: ${crewAddLines.join('; ')}`,
      );
    }
    if (historical.length) facts.push(...historical);

    const analysis: string[] = [];
    if (evaluation.sifPotential) {
      analysis.push(
        'SIF POTENTIAL — treat as life-critical. Stop work if controls are not verified.',
      );
    }
    if (evaluation.highEnergyFlag) {
      analysis.push(
        'High-energy hazard exposure documented. Direct controls required — PPE-only is insufficient.',
      );
    }
    if (!evaluation.controlsAdequate) {
      analysis.push(
        'Control gaps remain. Weak or missing controls increase injury severity.',
      );
    }
    if (evaluation.ppeOnlyHighEnergyHazards?.length) {
      analysis.push(
        `PPE-only on high-energy hazard(s): ${evaluation.ppeOnlyHighEnergyHazards.join(
          '; ',
        )}`,
      );
    }
    if (evaluation.requiresSupervisorReview) {
      analysis.push('Supervisor review required before approval.');
    }
    if (suggestions.gapWarnings?.length) {
      analysis.push(...suggestions.gapWarnings.slice(0, 5));
    }
    if (suggestions.hecaNotes?.length) {
      analysis.push(...suggestions.hecaNotes.slice(0, 3));
    }
    if (evaluation.supervisorReviewFlags?.length) {
      for (const f of evaluation.supervisorReviewFlags) {
        analysis.push(`[${f.severity}] ${f.message}`);
      }
    }
    if (analysis.length === 0) {
      analysis.push(
        'No critical gaps flagged. Verify controls match actual field conditions.',
      );
    }

    const actions: string[] = [];
    if (evaluation.blockSubmission) {
      actions.push(
        `BLOCKED — resolve before submit: ${evaluation.blockReasons.join(
          '; ',
        )}`,
      );
    }
    for (const h of suggestions.missedHazards?.slice(0, 5) ?? []) {
      actions.push(`Add hazard: ${h.description} (${h.reason})`);
    }
    for (const c of suggestions.missedControls?.slice(0, 5) ?? []) {
      actions.push(`Add control: ${c.description} (${c.reason})`);
    }
    for (const e of suggestions.requiredEnergyTypes ?? []) {
      if (!energySources.some((s) => s.energyType === e)) {
        actions.push(`Document energy source on wheel: ${e}`);
      }
    }
    if (evaluation.weakControls?.length) {
      actions.push(
        `Strengthen controls: ${evaluation.weakControls.join('; ')}`,
      );
    }
    if (workers.length > 0 && signedWorkers < workers.length) {
      actions.push(
        'All crew must sign hazard acknowledgment before work starts.',
      );
    }
    if (row.status === 'UNDER_REVIEW' || row.status === 'SUBMITTED') {
      actions.push(
        'Supervisor: review hazards, controls, and signatures — approve, reject, or request changes.',
      );
    }
    if (row.status === 'APPROVED') {
      actions.push(
        'Lock record after field use to prevent unauthorized edits.',
      );
    }
    actions.push('Verify controls in the field before starting work.');
    actions.push(
      'Escalate to HSE if SIF potential cannot be controlled at the task level.',
    );

    return {
      moduleType: kind === 'FLHA' ? 'FLHA' : 'JHA',
      recordId: id,
      facts,
      analysis,
      actions,
    };
  }
}
