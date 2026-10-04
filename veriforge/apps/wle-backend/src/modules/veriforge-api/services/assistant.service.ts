import { Injectable } from '@nestjs/common';
import { TrainingService } from './training.service';
import { VerificationService } from './verification.service';
import { ComplianceService } from './compliance.service';

export type AssistantDomain =
  | 'training'
  | 'verification'
  | 'compliance'
  | 'onboarding'
  | 'workflow'
  | 'knowledge'
  | 'general';

export type AssistantAction =
  | 'none'
  | 'assign_training'
  | 'start_verification'
  | 'run_compliance'
  | 'open_onboarding';

export type AssistantResponse = {
  domain: AssistantDomain;
  title: string;
  summary: string;
  steps: string[];
  knowledgeResults: Array<{ title: string; href: string; detail: string }>;
  complianceScore: number | null;
  action: {
    type: AssistantAction;
    label: string;
    payload?: Record<string, unknown>;
  } | null;
  metadata: {
    timestamp: string;
    userId: number | null;
    forgeStatus: 'pending' | 'forged' | 'verified' | 'failed';
    workflowStep: string;
  };
};

const KNOWLEDGE_BASE = [
  {
    title: 'Training Modules',
    href: '/veriforge/training/modules',
    detail: 'Assign and track industrial training modules.',
    keywords: ['training', 'module', 'progress', 'assign'],
  },
  {
    title: 'Verification Workflows',
    href: '/veriforge/verification/workflows',
    detail: 'Execute forgeCheck and monitor forgeStatus transitions.',
    keywords: ['verification', 'forgecheck', 'forgestatus', 'workflow'],
  },
  {
    title: 'Compliance Engine',
    href: '/veriforge/compliance',
    detail: 'Manage requirements, expiry alerts, and compliance scoring.',
    keywords: ['compliance', 'expiry', 'requirement', 'audit', 'score'],
  },
  {
    title: 'Onboarding Rail',
    href: '/veriforge/onboarding',
    detail: 'Guided industrial onboarding from identity to dashboard entry.',
    keywords: ['onboarding', 'welcome', 'identity', 'walkthrough'],
  },
  {
    title: 'Support Knowledge Base',
    href: '/support/knowledge-base',
    detail: 'Structured remediation cards for operational failures.',
    keywords: ['support', 'troubleshoot', 'knowledge', 'help'],
  },
];

@Injectable()
export class AssistantService {
  constructor(
    private readonly training: TrainingService,
    private readonly verification: VerificationService,
    private readonly compliance: ComplianceService,
  ) {}

  ask(input: { message: string; userId?: number | null }): AssistantResponse {
    const message = input.message.trim();
    const lower = message.toLowerCase();
    const userId = input.userId ?? null;
    const domain = this.detectDomain(lower);
    const knowledgeResults = this.searchKnowledge(lower);

    if (domain === 'training') {
      return this.trainingGuidance(message, userId, knowledgeResults);
    }
    if (domain === 'verification') {
      return this.verificationGuidance(message, userId, knowledgeResults);
    }
    if (domain === 'compliance') {
      return this.complianceGuidance(message, userId, knowledgeResults);
    }
    if (domain === 'onboarding') {
      return this.onboardingGuidance(userId, knowledgeResults);
    }
    if (domain === 'workflow' || this.wantsAction(lower)) {
      return this.workflowGuidance(lower, userId, knowledgeResults);
    }
    if (domain === 'knowledge') {
      return this.knowledgeGuidance(message, userId, knowledgeResults);
    }
    return this.generalGuidance(userId, knowledgeResults);
  }

  triggerAction(input: {
    action: AssistantAction;
    userId?: number | null;
    payload?: Record<string, unknown>;
  }) {
    const userId = input.userId ?? 1;
    const timestamp = new Date().toISOString();

    if (input.action === 'assign_training') {
      const moduleId =
        typeof input.payload?.moduleId === 'string'
          ? input.payload.moduleId
          : 'm-101';
      const result = this.training.assign({ moduleId, userId });
      return {
        action: input.action,
        result,
        metadata: {
          timestamp,
          userId,
          forgeStatus: 'forged' as const,
          workflowStep: 'training.assignment',
        },
      };
    }

    if (input.action === 'start_verification') {
      const targetId =
        typeof input.payload?.targetId === 'string'
          ? input.payload.targetId
          : `user-${userId}`;
      const result = this.verification.forgeCheck({
        targetId,
        checkType: 'assistant-triggered',
        userId,
      });
      return {
        action: input.action,
        result,
        metadata: {
          timestamp,
          userId,
          forgeStatus: 'pending' as const,
          workflowStep: 'verification.forgeCheck',
        },
      };
    }

    if (input.action === 'run_compliance') {
      const result = this.compliance.runWorkflowAutomation(userId);
      return {
        action: input.action,
        result,
        metadata: {
          timestamp,
          userId,
          forgeStatus: result.forgeStatus as 'verified' | 'failed',
          workflowStep: 'compliance.automation',
        },
      };
    }

    return {
      action: input.action,
      result: { href: '/veriforge/onboarding' },
      metadata: {
        timestamp,
        userId,
        forgeStatus: 'verified' as const,
        workflowStep: 'onboarding.open',
      },
    };
  }

  private detectDomain(lower: string): AssistantDomain {
    if (/(train|module|progress|assign)/.test(lower)) return 'training';
    if (/(verif|forgecheck|forgestatus|workflow)/.test(lower)) {
      return 'verification';
    }
    if (/(complian|expir|requirement|audit|score)/.test(lower)) {
      return 'compliance';
    }
    if (/(onboard|welcome|identity|walkthrough)/.test(lower)) {
      return 'onboarding';
    }
    if (/(trigger|start|run|assign|launch)/.test(lower)) return 'workflow';
    if (/(search|knowledge|help|how|where)/.test(lower)) return 'knowledge';
    return 'general';
  }

  private wantsAction(lower: string) {
    return /(assign training|start verification|run compliance|begin onboarding)/.test(
      lower,
    );
  }

  private searchKnowledge(lower: string) {
    return KNOWLEDGE_BASE.filter((item) =>
      item.keywords.some((keyword) => lower.includes(keyword)),
    )
      .slice(0, 4)
      .map(({ title, href, detail }) => ({ title, href, detail }));
  }

  private trainingGuidance(
    message: string,
    userId: number | null,
    knowledgeResults: AssistantResponse['knowledgeResults'],
  ): AssistantResponse {
    const modules = this.training.modules();
    const progress = this.training.progress(userId ?? 1);
    const wantsAssign = /assign/.test(message.toLowerCase());
    return {
      domain: 'training',
      title: 'TRAINING GUIDANCE',
      summary:
        'Training rail is operational. Modules are available and progress is measurable.',
      steps: [
        `Catalog size: ${modules.length} active modules.`,
        `Progress: ${progress.completed}/${progress.total} complete, ${progress.inProgress} in progress.`,
        'Assign required modules by role before shift start.',
        'Escalate overdue modules through notification queue.',
      ],
      knowledgeResults:
        knowledgeResults.length > 0
          ? knowledgeResults
          : [
              {
                title: 'Training Modules',
                href: '/veriforge/training/modules',
                detail: 'Open module catalog and assignment controls.',
              },
            ],
      complianceScore: null,
      action: wantsAssign
        ? {
            type: 'assign_training',
            label: 'Assign Lockout-Tagout Module',
            payload: { moduleId: 'm-101' },
          }
        : {
            type: 'assign_training',
            label: 'Trigger Training Assignment',
            payload: { moduleId: 'm-101' },
          },
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        forgeStatus: 'verified',
        workflowStep: 'training.guidance',
      },
    };
  }

  private verificationGuidance(
    message: string,
    userId: number | null,
    knowledgeResults: AssistantResponse['knowledgeResults'],
  ): AssistantResponse {
    const wantsStart = /(start|run|trigger|forgecheck)/.test(
      message.toLowerCase(),
    );
    return {
      domain: 'verification',
      title: 'VERIFICATION ASSISTANCE',
      summary:
        'forgeCheck execution path is ready. Monitor forgeStatus through pending → verified/failed.',
      steps: [
        'Initiate forgeCheck against target identity or asset.',
        'Track forgeStatus until workflow completion.',
        'Close with workflow/complete and persist audit metadata.',
        'Escalate failed checks to supervisor lane immediately.',
      ],
      knowledgeResults:
        knowledgeResults.length > 0
          ? knowledgeResults
          : [
              {
                title: 'Verification Checks',
                href: '/veriforge/verification/checks',
                detail: 'Inspect active forgeCheck runs and outcomes.',
              },
            ],
      complianceScore: null,
      action: {
        type: 'start_verification',
        label: wantsStart ? 'Start forgeCheck Now' : 'Trigger Verification',
        payload: { targetId: `user-${userId ?? 1}` },
      },
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        forgeStatus: 'pending',
        workflowStep: 'verification.guidance',
      },
    };
  }

  private complianceGuidance(
    _message: string,
    userId: number | null,
    knowledgeResults: AssistantResponse['knowledgeResults'],
  ): AssistantResponse {
    const score = this.compliance.score(userId);
    return {
      domain: 'compliance',
      title: 'COMPLIANCE ADVISORY',
      summary: `Compliance score is ${score.score}%. ${score.expiringSoon} document(s) approaching expiry.`,
      steps: [
        `Requirements active: ${score.totalRequirements}.`,
        `Verified documents: ${score.verifiedDocuments}.`,
        `Pending: ${score.pendingDocuments} · Failed: ${score.failedDocuments}.`,
        score.score < 70
          ? 'Score below threshold. Run remediation and expiry alerts now.'
          : 'Score stable. Continue scheduled verification cadence.',
      ],
      knowledgeResults:
        knowledgeResults.length > 0
          ? knowledgeResults
          : [
              {
                title: 'Compliance Engine',
                href: '/veriforge/compliance',
                detail: 'Open requirement, upload, and audit controls.',
              },
            ],
      complianceScore: score.score,
      action: {
        type: 'run_compliance',
        label: 'Run Compliance Automation',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        forgeStatus: score.score >= 70 ? 'verified' : 'failed',
        workflowStep: 'compliance.guidance',
      },
    };
  }

  private onboardingGuidance(
    userId: number | null,
    knowledgeResults: AssistantResponse['knowledgeResults'],
  ): AssistantResponse {
    return {
      domain: 'onboarding',
      title: 'ONBOARDING WALKTHROUGH',
      summary:
        'Industrial onboarding rail: identity → training → verification → compliance → dashboard.',
      steps: [
        'Confirm identity fields and role assignment.',
        'Auto-assign required training modules.',
        'Execute forgeCheck and confirm forgeStatus.',
        'Upload compliance documents and complete final review.',
      ],
      knowledgeResults:
        knowledgeResults.length > 0
          ? knowledgeResults
          : [
              {
                title: 'Onboarding',
                href: '/veriforge/onboarding',
                detail: 'Launch guided forged-metal onboarding flow.',
              },
            ],
      complianceScore: null,
      action: {
        type: 'open_onboarding',
        label: 'Open Onboarding Rail',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        forgeStatus: 'forged',
        workflowStep: 'onboarding.guidance',
      },
    };
  }

  private workflowGuidance(
    lower: string,
    userId: number | null,
    knowledgeResults: AssistantResponse['knowledgeResults'],
  ): AssistantResponse {
    if (lower.includes('training')) {
      return this.trainingGuidance(lower, userId, knowledgeResults);
    }
    if (lower.includes('verification') || lower.includes('forge')) {
      return this.verificationGuidance(lower, userId, knowledgeResults);
    }
    if (lower.includes('compliance')) {
      return this.complianceGuidance(lower, userId, knowledgeResults);
    }
    return this.onboardingGuidance(userId, knowledgeResults);
  }

  private knowledgeGuidance(
    message: string,
    userId: number | null,
    knowledgeResults: AssistantResponse['knowledgeResults'],
  ): AssistantResponse {
    const results =
      knowledgeResults.length > 0
        ? knowledgeResults
        : KNOWLEDGE_BASE.slice(0, 3).map(({ title, href, detail }) => ({
            title,
            href,
            detail,
          }));
    return {
      domain: 'knowledge',
      title: 'KNOWLEDGE SEARCH',
      summary: `Matched ${results.length} industrial guidance card(s) for: "${message}".`,
      steps: [
        'Select the highest-relevance card.',
        'Execute linked workflow with metadata intact.',
        'Validate forgeStatus after action completion.',
      ],
      knowledgeResults: results,
      complianceScore: null,
      action: null,
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        forgeStatus: 'verified',
        workflowStep: 'knowledge.search',
      },
    };
  }

  private generalGuidance(
    userId: number | null,
    knowledgeResults: AssistantResponse['knowledgeResults'],
  ): AssistantResponse {
    return {
      domain: 'general',
      title: 'VERIFORGE ASSISTANT ONLINE',
      summary:
        'I provide industrial guidance for training, verification, compliance, and onboarding. State the operational objective.',
      steps: [
        'Ask for training progress or module assignment.',
        'Request forgeCheck status or verification start.',
        'Request compliance score and expiry posture.',
        'Request onboarding walkthrough for new operators.',
      ],
      knowledgeResults:
        knowledgeResults.length > 0
          ? knowledgeResults
          : KNOWLEDGE_BASE.slice(0, 3).map(({ title, href, detail }) => ({
              title,
              href,
              detail,
            })),
      complianceScore: null,
      action: null,
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        forgeStatus: 'verified',
        workflowStep: 'assistant.ready',
      },
    };
  }
}
