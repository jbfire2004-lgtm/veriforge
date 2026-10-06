import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ContractorComplianceEngineService } from '../pm-contractor-portal/contractor-compliance-engine.service';
import type {
  ContractorComplianceEngineInput,
  ContractorComplianceEngineOutput,
  SubmittedDocument,
} from '../pm-contractor-portal/contractor-compliance-engine.types';
import type {
  ContractorVerificationAiResult,
  ContractorVerificationFinalStatus,
  ContractorVerificationJson,
  DocumentAuthenticityDetail,
} from './contractor-verification-ai.types';

@Injectable()
export class ContractorVerificationAiService {
  constructor(
    private readonly complianceEngine: ContractorComplianceEngineService,
  ) {}

  async verify(input: {
    membershipId?: string;
    engineInput?: ContractorComplianceEngineInput;
    work_scope?: ContractorComplianceEngineInput['work_scope'];
  }): Promise<ContractorVerificationAiResult> {
    const engineInput = await this.resolveInput(input);
    const engine_detail = this.complianceEngine.generate(engineInput);

    const documentScores = this.assessDocumentAuthenticity(
      engineInput.submitted_documents ?? [],
    );
    const authenticity_score = this.aggregateAuthenticityScore(
      documentScores,
      engineInput,
    );
    const compliance_score = this.computeComplianceScore(
      engine_detail,
      engineInput,
    );
    const expired_items = this.detectExpiredItems(
      engineInput.submitted_documents ?? [],
    );
    const inconsistent_data_flags = this.detectInconsistencies(
      engineInput,
      engine_detail,
    );
    const risk_flags = this.buildRiskFlags(
      engine_detail,
      expired_items,
      inconsistent_data_flags,
    );
    const missing_items = this.buildMissingItems(engine_detail);
    const recommended_actions = this.buildRecommendedActions(engine_detail);
    const final_status = this.mapFinalStatus(engine_detail.approval_status);
    const required_documents = this.buildRequiredDocuments(
      engine_detail,
      missing_items,
    );
    const verifier_guidance = this.buildVerifierGuidance(
      final_status,
      missing_items,
      expired_items,
      engine_detail,
    );
    const pm_summary = this.buildPmSummary(
      engineInput,
      engine_detail,
      authenticity_score,
      compliance_score,
      final_status,
      risk_flags,
    );

    const core: ContractorVerificationJson = {
      authenticity_score,
      compliance_score,
      risk_flags,
      missing_items,
      recommended_actions,
      final_status,
    };

    return {
      ...core,
      verification_id: randomUUID(),
      source: 'rule_engine',
      model: null,
      expired_items,
      inconsistent_data_flags,
      pm_summary,
      verifier_guidance,
      required_documents,
      engine_detail,
    };
  }

  private async resolveInput(input: {
    membershipId?: string;
    engineInput?: ContractorComplianceEngineInput;
    work_scope?: ContractorComplianceEngineInput['work_scope'];
  }): Promise<ContractorComplianceEngineInput> {
    if (input.membershipId) {
      return this.complianceEngine.buildInputFromMembership(
        input.membershipId,
        input.work_scope,
      );
    }
    if (input.engineInput) {
      return input.engineInput;
    }
    throw new BadRequestException('membershipId or engineInput is required');
  }

  private assessDocumentAuthenticity(
    docs: SubmittedDocument[],
  ): DocumentAuthenticityDetail[] {
    return docs.map((doc) => {
      const label = doc.name ?? doc.type;
      let score = 72;
      const signals: string[] = [];

      if (doc.status === 'current') {
        score += 18;
        signals.push('Marked current');
      } else if (doc.status === 'expired') {
        score -= 35;
        signals.push('Expired — renew or replace');
      } else if (doc.status === 'partial' || doc.status === 'draft') {
        score -= 18;
        signals.push(`Status: ${doc.status}`);
      }

      if (doc.expires_at) {
        const expires = new Date(doc.expires_at);
        if (!Number.isNaN(expires.getTime())) {
          const days = Math.ceil((expires.getTime() - Date.now()) / 86_400_000);
          if (days < 0) {
            score -= 25;
            signals.push(`Expired ${Math.abs(days)} day(s) ago`);
          } else if (days <= 30) {
            score -= 8;
            signals.push(`Expires in ${days} day(s)`);
          } else {
            score += 6;
            signals.push('Valid expiry horizon');
          }
        }
      } else if (this.isInsuranceOrWcbDoc(doc)) {
        score -= 12;
        signals.push('No expiry date on insurance/WCB document');
      }

      if (
        doc.notes?.toLowerCase().includes('manual') ||
        doc.notes?.toLowerCase().includes('upload')
      ) {
        score += 4;
        signals.push('Upload metadata present');
      }

      return {
        document: label,
        score: Math.max(0, Math.min(100, Math.round(score))),
        signals,
      };
    });
  }

  private isInsuranceOrWcbDoc(doc: SubmittedDocument): boolean {
    const text = `${doc.type} ${doc.name ?? ''}`.toLowerCase();
    return (
      text.includes('insurance') ||
      text.includes('wcb') ||
      text.includes('coi') ||
      text.includes('workers comp')
    );
  }

  private aggregateAuthenticityScore(
    details: DocumentAuthenticityDetail[],
    input: ContractorComplianceEngineInput,
  ): number {
    if (!details.length) {
      const hasStats =
        input.safety_stats?.TRIF != null || input.safety_stats?.LTIF != null;
      return hasStats ? 42 : 28;
    }

    const avg = details.reduce((sum, d) => sum + d.score, 0) / details.length;
    let score = avg;

    const expiredCount = details.filter((d) =>
      d.signals.some((s) => s.includes('Expired')),
    ).length;
    if (expiredCount > 0) {
      score -= Math.min(20, expiredCount * 6);
    }

    const insuranceDocs = (input.submitted_documents ?? []).filter((d) =>
      this.isInsuranceOrWcbDoc(d),
    );
    if (!insuranceDocs.length) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private computeComplianceScore(
    engine: ContractorComplianceEngineOutput,
    input: ContractorComplianceEngineInput,
  ): number {
    let score = 100;

    for (const gap of engine.compliance_gaps) {
      const weight =
        gap.priority === 'high' ? 14 : gap.priority === 'medium' ? 9 : 5;
      if (gap.status === 'missing') score -= weight;
      else if (gap.status === 'expired') score -= weight - 2;
      else if (gap.status === 'partial' || gap.status === 'weak')
        score -= weight - 4;
    }

    if (engine.performance_assessment.overall_performance === 'concerning') {
      score -= 18;
    } else if (engine.performance_assessment.stats_rating === 'concerning') {
      score -= 12;
    }

    const trif = input.safety_stats?.TRIF;
    const ltif = input.safety_stats?.LTIF;
    if (trif != null && trif > 3) score -= 15;
    else if (trif != null && trif > 1.5) score -= 8;
    if (ltif != null && ltif > 1.5) score -= 12;

    if (
      engine.risk_profile.sif_exposure &&
      engine.approval_status !== 'approve'
    ) {
      score -= 10;
    }

    if (engine.performance_assessment.incident_trend === 'deteriorating') {
      score -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private detectExpiredItems(docs: SubmittedDocument[]): string[] {
    const now = Date.now();
    const items: string[] = [];

    for (const doc of docs) {
      const label = doc.name ?? doc.type;
      if (doc.status === 'expired') {
        items.push(label);
        continue;
      }
      if (doc.expires_at) {
        const expires = new Date(doc.expires_at).getTime();
        if (!Number.isNaN(expires) && expires < now) {
          items.push(`${label} (expired ${doc.expires_at.slice(0, 10)})`);
        }
      }
    }

    return [...new Set(items)];
  }

  private detectInconsistencies(
    input: ContractorComplianceEngineInput,
    engine: ContractorComplianceEngineOutput,
  ): string[] {
    const flags: string[] = [];
    const trif = input.safety_stats?.TRIF;
    const incidents = input.incident_history?.length ?? 0;

    if (trif != null && trif <= 1 && incidents >= 5) {
      flags.push('Low TRIF reported but elevated incident history on file');
    }
    if (trif != null && trif > 3 && incidents === 0) {
      flags.push('High TRIF reported without matching incident records');
    }

    const hasInsuranceDoc = (input.submitted_documents ?? []).some((d) =>
      this.isInsuranceOrWcbDoc(d),
    );
    const missingInsurance = engine.compliance_gaps.some(
      (g) =>
        g.status === 'missing' &&
        (g.requirement.toLowerCase().includes('insurance') ||
          g.requirement.toLowerCase().includes('wcb')),
    );
    if (hasInsuranceDoc && missingInsurance) {
      flags.push(
        'Insurance/WCB documents present but requirement still flagged missing',
      );
    }

    if (
      engine.performance_assessment.stats_rating === 'strong' &&
      engine.performance_assessment.incident_trend === 'deteriorating'
    ) {
      flags.push(
        'Strong lagging indicators conflict with deteriorating incident trend',
      );
    }

    return flags;
  }

  private buildRiskFlags(
    engine: ContractorComplianceEngineOutput,
    expired_items: string[],
    inconsistent_data_flags: string[],
  ): string[] {
    const flags = new Set<string>();

    if (expired_items.length) {
      flags.add(`${expired_items.length} expired document(s) on file`);
    }

    for (const gap of engine.compliance_gaps.filter(
      (g) => g.priority === 'high',
    )) {
      flags.add(`${gap.status.toUpperCase()}: ${gap.requirement}`);
    }

    if (engine.risk_profile.sif_exposure) {
      flags.add('SIF-potential work scope — enhanced oversight required');
    }

    if (engine.risk_profile.inherent_risk_level === 'critical') {
      flags.add('Critical inherent scope risk');
    }

    if (engine.performance_assessment.overall_performance === 'concerning') {
      flags.add('Concerning safety performance (TRIF/LTIF or audit findings)');
    }

    if (engine.performance_assessment.incident_trend === 'deteriorating') {
      flags.add('Deteriorating incident trend');
    }

    for (const factor of engine.risk_profile.risk_factors.slice(0, 4)) {
      flags.add(`Scope hazard: ${factor}`);
    }

    for (const flag of inconsistent_data_flags) {
      flags.add(`Data inconsistency: ${flag}`);
    }

    return [...flags];
  }

  private buildMissingItems(
    engine: ContractorComplianceEngineOutput,
  ): string[] {
    return engine.compliance_gaps
      .filter((g) => g.status === 'missing')
      .map((g) => g.requirement);
  }

  private buildRecommendedActions(
    engine: ContractorComplianceEngineOutput,
  ): string[] {
    const actions = new Set<string>();

    for (const gap of engine.compliance_gaps) {
      actions.add(gap.remediation);
    }

    for (const condition of engine.conditions) {
      actions.add(condition.description);
    }

    if (engine.approval_status === 'reject') {
      actions.add(
        'Hold mobilization until all high-priority gaps are closed and re-verified.',
      );
    } else if (engine.approval_status === 'conditional') {
      actions.add(
        'Issue conditional approval letter with documented hold points before full scope.',
      );
    }

    return [...actions].slice(0, 12);
  }

  private buildRequiredDocuments(
    engine: ContractorComplianceEngineOutput,
    missing_items: string[],
  ): string[] {
    const required = new Set(missing_items);

    for (const gap of engine.compliance_gaps.filter(
      (g) => g.status === 'expired' || g.status === 'partial',
    )) {
      required.add(gap.requirement);
    }

    if (![...required].some((r) => r.toLowerCase().includes('insurance'))) {
      const insuranceGap = engine.compliance_gaps.find((g) =>
        g.requirement.toLowerCase().includes('insurance'),
      );
      if (insuranceGap && insuranceGap.status !== 'missing') {
        /* already covered */
      } else if (!insuranceGap) {
        required.add('Commercial liability insurance (COI)');
      }
    }

    return [...required];
  }

  private buildVerifierGuidance(
    final_status: ContractorVerificationFinalStatus,
    missing_items: string[],
    expired_items: string[],
    engine: ContractorComplianceEngineOutput,
  ): string[] {
    const steps: string[] = [];

    if (final_status === 'Rejected') {
      steps.push(
        'Do not approve mobilization — return package to contractor with gap list.',
      );
    } else if (final_status === 'Conditionally Approved') {
      steps.push(
        'Approve limited scope only after uploading missing/expired items.',
      );
    } else {
      steps.push(
        'Proceed with standard onboarding and quarterly compliance review.',
      );
    }

    if (missing_items.length) {
      steps.push(
        `Request ${missing_items.length} missing item(s) before site access.`,
      );
    }

    if (expired_items.length) {
      steps.push(
        `Verify renewed copies for: ${expired_items.slice(0, 3).join(', ')}.`,
      );
    }

    if (engine.risk_profile.sif_exposure) {
      steps.push('Assign dedicated HSE oversight for SIF-prone tasks.');
    }

    steps.push('Cross-check OSHA/WCB logs against submitted TRIF/LTIF.');
    steps.push(
      'Confirm worker training records match project role requirements.',
    );

    return steps;
  }

  private buildPmSummary(
    input: ContractorComplianceEngineInput,
    engine: ContractorComplianceEngineOutput,
    authenticity_score: number,
    compliance_score: number,
    final_status: ContractorVerificationFinalStatus,
    risk_flags: string[],
  ): string {
    const name = input.contractor_profile.name ?? 'Contractor';
    const scope =
      engine.risk_profile.work_scope_summary || 'Assigned work scope';
    const gapCount = engine.compliance_gaps.length;
    const topRisks = risk_flags.slice(0, 3).join('; ') || 'No critical flags';

    return [
      `${name} — ${final_status}.`,
      `Authenticity ${authenticity_score}/100 · Compliance ${compliance_score}/100.`,
      `Scope risk: ${engine.risk_profile.inherent_risk_level} (${engine.risk_profile.risk_score}). ${scope}.`,
      `${gapCount} compliance gap(s); performance ${engine.performance_assessment.overall_performance}.`,
      `Key risks: ${topRisks}.`,
      engine.contractor_feedback,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private mapFinalStatus(
    approval: ContractorComplianceEngineOutput['approval_status'],
  ): ContractorVerificationFinalStatus {
    if (approval === 'approve') return 'Approved';
    if (approval === 'conditional') return 'Conditionally Approved';
    return 'Rejected';
  }
}
