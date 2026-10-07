import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OcrExtractionService } from '../training-ingestion/ocr-extraction.service';
import { OcrFieldExtractorService } from '../training-ingestion/ocr-field-extractor.service';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AuthenticityIndicator,
  DocumentAutoLink,
  DocumentIntelligenceAiInput,
  DocumentIntelligenceAiJson,
  DocumentIntelligenceAiResult,
  DocumentIntelligenceMetadata,
  DocumentIntelligenceType,
  DocumentRecommendedAction,
} from './document-intelligence-ai.types';

type ClassificationRule = {
  type: DocumentIntelligenceType;
  textPatterns: RegExp[];
  filePatterns: RegExp[];
  weight: number;
};

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    type: 'sds',
    textPatterns: [
      /safety data sheet|material safety|whmis|ghs|hazard identification/i,
    ],
    filePatterns: [/sds|msds/i],
    weight: 10,
  },
  {
    type: 'training_certificate',
    textPatterns: [
      /certificate of completion|this certifies|has successfully completed|training certificate/i,
    ],
    filePatterns: [/cert|certificate|training/i],
    weight: 9,
  },
  {
    type: 'training_proof',
    textPatterns: [/training record|course completion|transcript|wallet card/i],
    filePatterns: [/training|wallet/i],
    weight: 7,
  },
  {
    type: 'permit',
    textPatterns: [
      /work permit|hot work permit|confined space entry permit|permit to work/i,
    ],
    filePatterns: [/permit/i],
    weight: 9,
  },
  {
    type: 'inspection',
    textPatterns: [
      /inspection report|inspection checklist|audit findings|deficiency/i,
    ],
    filePatterns: [/inspection|audit|checklist/i],
    weight: 8,
  },
  {
    type: 'insurance',
    textPatterns: [
      /certificate of insurance|general liability|commercial insurance|policy number/i,
    ],
    filePatterns: [/insurance|coi|liability/i],
    weight: 9,
  },
  {
    type: 'wcb_clearance',
    textPatterns: [
      /workers.? compensation|wcb clearance|worksafe|compensation board/i,
    ],
    filePatterns: [/wcb|worksafe/i],
    weight: 9,
  },
  {
    type: 'jha_flha',
    textPatterns: [/job hazard analysis|field level hazard|flha|jha\b/i],
    filePatterns: [/jha|flha|hazard analysis/i],
    weight: 8,
  },
  {
    type: 'sif_heca',
    textPatterns: [
      /serious injury|fatality prevention|high energy control|heca|sif\b/i,
    ],
    filePatterns: [/sif|heca|high.?energy/i],
    weight: 8,
  },
  {
    type: 'incident_report',
    textPatterns: [
      /incident report|near miss|injury report|first report of injury/i,
    ],
    filePatterns: [/incident|injury|near.?miss/i],
    weight: 7,
  },
  {
    type: 'safety_program',
    textPatterns: [
      /safety (?:program|manual|management system)|health and safety program|ohs program|sms manual/i,
    ],
    filePatterns: [/safety.?program|hsms|ohs.?program/i],
    weight: 8,
  },
  {
    type: 'policy',
    textPatterns: [
      /safety policy|code of conduct|corporate policy|procedure manual/i,
    ],
    filePatterns: [/policy|procedure/i],
    weight: 6,
  },
  {
    type: 'equipment_manual',
    textPatterns: [
      /operator manual|oem manual|maintenance manual|equipment instruction/i,
    ],
    filePatterns: [/manual|oem/i],
    weight: 6,
  },
];

const PROVIDER_LABEL =
  /(?:provider|training provider|issuer|instructor|delivered by)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9 .&'\-]{2,80})/i;
const COMPANY_LABEL =
  /(?:company|employer|organization|contractor)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9 .&'\-]{2,80})/i;
const PRODUCT_LABEL =
  /(?:product name|chemical name|substance)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9 .&'\-]{2,80})/i;
const PERMIT_LABEL =
  /(?:permit type|type of permit)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9 .&'\-]{2,60})/i;

@Injectable()
export class DocumentIntelligenceAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ocr: OcrExtractionService,
    private readonly fieldExtractor: OcrFieldExtractorService,
  ) {}

  async analyze(
    input: DocumentIntelligenceAiInput,
  ): Promise<DocumentIntelligenceAiResult> {
    const context = await this.resolveContext(input);
    const document_type = this.classifyDocumentType(
      context.combinedText,
      context.fileName,
    );
    const metadata = this.extractMetadata(
      context.combinedText,
      context.fileName,
      context.mimeType,
      input.hints,
    );
    const authenticity = this.assessAuthenticity(
      document_type,
      metadata,
      context.combinedText,
      context.ocrConfidence,
    );
    const auto_links = await this.buildAutoLinks(
      document_type,
      metadata,
      input,
      context,
    );
    const recommended_actions = this.buildRecommendedActions(
      document_type,
      metadata,
      authenticity,
      auto_links,
    );
    const confidence_score = this.computeConfidenceScore(
      metadata,
      authenticity.indicators,
      auto_links,
    );

    const core: DocumentIntelligenceAiJson = {
      document_type,
      metadata,
      authenticity_score: authenticity.score,
      auto_links,
      recommended_actions,
    };

    return {
      ...core,
      intelligence_id: randomUUID(),
      confidence_score,
      authenticity_indicators: authenticity.indicators,
      field_summary: this.buildFieldSummary(core, confidence_score),
      source: 'rule_engine',
      model: null,
      document_id: input.documentId,
    };
  }

  async analyzeUpload(
    file: Express.Multer.File,
    body: {
      companyId?: string;
      projectId?: string;
      workerId?: string;
      hints?: string;
    },
  ): Promise<DocumentIntelligenceAiResult> {
    if (!file?.buffer?.length)
      throw new BadRequestException('file is required');

    const ocrResult = await this.ocr.extractWithRetry(
      file.buffer,
      file.mimetype || 'application/octet-stream',
    );
    let hints: Partial<DocumentIntelligenceMetadata> | undefined;
    if (body.hints) {
      try {
        hints = JSON.parse(body.hints) as Partial<DocumentIntelligenceMetadata>;
      } catch {
        hints = undefined;
      }
    }

    return this.analyze({
      ocrText: ocrResult.text,
      fileName: file.originalname,
      mimeType: file.mimetype,
      companyId: body.companyId ? parseInt(body.companyId, 10) : undefined,
      projectId: body.projectId ? parseInt(body.projectId, 10) : undefined,
      workerId: body.workerId ? parseInt(body.workerId, 10) : undefined,
      hints,
    });
  }

  private async resolveContext(input: DocumentIntelligenceAiInput) {
    let combinedText = input.ocrText ?? '';
    let fileName = input.fileName ?? '';
    const mimeType = input.mimeType;
    let ocrConfidence = combinedText ? 0.55 : 0;

    if (input.documentId) {
      const doc = await this.prisma.document.findUnique({
        where: { id: input.documentId },
        include: {
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyId: true,
            },
          },
          company: { select: { id: true, name: true } },
        },
      });
      if (!doc || doc.deleted)
        throw new NotFoundException('Document not found');

      fileName = fileName || doc.name;
      combinedText = [
        combinedText,
        doc.name,
        doc.description,
        doc.type,
        ...(doc.tags ?? []),
      ]
        .filter(Boolean)
        .join('\n');

      if (!input.companyId && doc.companyId) input.companyId = doc.companyId;
      if (!input.workerId && doc.workerId) input.workerId = doc.workerId;

      if (doc.worker) {
        input.hints = {
          ...input.hints,
          worker_name: `${doc.worker.firstName} ${doc.worker.lastName}`.trim(),
        };
      }
      if (doc.company) {
        input.hints = { ...input.hints, company: doc.company.name };
      }
    }

    if (!combinedText.trim() && !fileName) {
      throw new BadRequestException(
        'ocrText, fileName, or documentId is required',
      );
    }

    if (combinedText.trim()) {
      const fields = this.fieldExtractor.extract(combinedText);
      ocrConfidence = Math.max(ocrConfidence, fields.confidence);
    }

    return { combinedText, fileName, mimeType, ocrConfidence };
  }

  private classifyDocumentType(
    text: string,
    fileName: string,
  ): DocumentIntelligenceType {
    const corpus = `${text}\n${fileName}`.toLowerCase();
    let best: { type: DocumentIntelligenceType; score: number } = {
      type: 'other',
      score: 0,
    };

    for (const rule of CLASSIFICATION_RULES) {
      let score = 0;
      for (const re of rule.textPatterns) {
        if (re.test(corpus)) score += rule.weight;
      }
      for (const re of rule.filePatterns) {
        if (re.test(fileName)) score += rule.weight * 0.8;
      }
      if (score > best.score) best = { type: rule.type, score };
    }

    return best.score > 0 ? best.type : 'other';
  }

  private extractMetadata(
    text: string,
    fileName: string,
    mimeType: string | undefined,
    hints?: Partial<DocumentIntelligenceMetadata>,
  ): DocumentIntelligenceMetadata {
    const fields = this.fieldExtractor.extract(text);
    const metadata: DocumentIntelligenceMetadata = {
      file_name: fileName || undefined,
      mime_type: mimeType,
      worker_name: hints?.worker_name ?? fields.workerName,
      training_type: hints?.training_type ?? fields.certificationName,
      certification_code: hints?.certification_code ?? fields.certificationCode,
      issue_date: hints?.issue_date ?? fields.issuedAt,
      expiry_date: hints?.expiry_date ?? fields.expiresAt,
      certificate_number: hints?.certificate_number ?? fields.certificateNumber,
      company: hints?.company,
      provider: hints?.provider,
      product_name: hints?.product_name,
      policy_type: hints?.policy_type,
      permit_type: hints?.permit_type,
    };

    const providerMatch = PROVIDER_LABEL.exec(text);
    if (!metadata.provider && providerMatch?.[1]) {
      metadata.provider = providerMatch[1].trim();
    }

    const companyMatch = COMPANY_LABEL.exec(text);
    if (!metadata.company && companyMatch?.[1]) {
      metadata.company = companyMatch[1].trim();
    }

    const productMatch = PRODUCT_LABEL.exec(text);
    if (!metadata.product_name && productMatch?.[1]) {
      metadata.product_name = productMatch[1].trim();
    }

    const permitMatch = PERMIT_LABEL.exec(text);
    if (!metadata.permit_type && permitMatch?.[1]) {
      metadata.permit_type = permitMatch[1].trim();
    }

    if (!metadata.training_type && /whmis/i.test(text))
      metadata.training_type = 'WHMIS';
    if (!metadata.training_type && /first aid/i.test(text))
      metadata.training_type = 'First Aid';

    return this.pruneMetadata(metadata);
  }

  private pruneMetadata(
    metadata: DocumentIntelligenceMetadata,
  ): DocumentIntelligenceMetadata {
    const out: DocumentIntelligenceMetadata = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (value != null && String(value).trim()) {
        (out as Record<string, string>)[key] = String(value).trim();
      }
    }
    return out;
  }

  private assessAuthenticity(
    documentType: DocumentIntelligenceType,
    metadata: DocumentIntelligenceMetadata,
    text: string,
    ocrConfidence: number,
  ): { score: number; indicators: AuthenticityIndicator[] } {
    const indicators: AuthenticityIndicator[] = [];
    let score = 45 + Math.round(ocrConfidence * 30);

    if (metadata.certificate_number) {
      score += 12;
      indicators.push({
        signal: 'Certificate / reference number detected',
        impact: 'positive',
        weight: 12,
      });
    }

    if (metadata.issue_date) {
      score += 8;
      indicators.push({
        signal: 'Issue date present',
        impact: 'positive',
        weight: 8,
      });
    }

    if (metadata.expiry_date) {
      const expiry = this.parseDate(metadata.expiry_date);
      if (expiry) {
        const days = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
        if (days < 0) {
          score -= 28;
          indicators.push({
            signal: `Document expired ${Math.abs(days)} day(s) ago`,
            impact: 'negative',
            weight: -28,
          });
        } else if (days <= 30) {
          score -= 10;
          indicators.push({
            signal: `Expires in ${days} day(s) — renew soon`,
            impact: 'negative',
            weight: -10,
          });
        } else {
          score += 6;
          indicators.push({
            signal: 'Valid expiry horizon',
            impact: 'positive',
            weight: 6,
          });
        }
      }
    } else if (this.requiresExpiry(documentType)) {
      score -= 14;
      indicators.push({
        signal: 'No expiry date on time-sensitive document',
        impact: 'negative',
        weight: -14,
      });
    }

    if (metadata.provider) {
      score += 6;
      indicators.push({
        signal: 'Training / issuing provider identified',
        impact: 'positive',
        weight: 6,
      });
    }

    if (metadata.worker_name) {
      score += 5;
      indicators.push({
        signal: 'Worker name extracted',
        impact: 'positive',
        weight: 5,
      });
    }

    if (/signature|signed by|authorized/i.test(text)) {
      score += 5;
      indicators.push({
        signal: 'Signature language detected',
        impact: 'positive',
        weight: 5,
      });
    }

    if (/photoshop|sample|template only|lorem ipsum/i.test(text)) {
      score -= 25;
      indicators.push({
        signal: 'Template or sample language detected',
        impact: 'negative',
        weight: -25,
      });
    }

    if (text.includes('[VERA_OCR_STUB]') || text.length < 40) {
      score -= 15;
      indicators.push({
        signal: 'Limited OCR text — manual review recommended',
        impact: 'negative',
        weight: -15,
      });
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      indicators,
    };
  }

  private requiresExpiry(type: DocumentIntelligenceType): boolean {
    return [
      'training_certificate',
      'training_proof',
      'insurance',
      'wcb_clearance',
      'permit',
      'sds',
    ].includes(type);
  }

  private async buildAutoLinks(
    documentType: DocumentIntelligenceType,
    metadata: DocumentIntelligenceMetadata,
    input: DocumentIntelligenceAiInput,
    context: { combinedText: string },
  ): Promise<DocumentAutoLink[]> {
    const links: DocumentAutoLink[] = [];

    const workerLink = await this.resolveWorkerLink(metadata, input);
    if (workerLink) links.push(workerLink);

    if (input.workerId && !links.some((l) => l.entity_type === 'worker')) {
      const worker = await this.prisma.worker.findUnique({
        where: { id: input.workerId },
        select: { id: true, firstName: true, lastName: true },
      });
      if (worker) {
        links.push({
          entity_type: 'worker',
          entity_id: worker.id,
          label: `${worker.firstName} ${worker.lastName}`.trim(),
          confidence: 95,
          method: 'context_hint',
        });
      }
    }

    const companyLink = await this.resolveCompanyLink(metadata, input);
    if (companyLink) links.push(companyLink);

    const trainingLink = await this.resolveTrainingRecordLink(
      links,
      metadata,
      input,
    );
    if (trainingLink) links.push(trainingLink);

    if (input.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { id: true, name: true },
      });
      if (project) {
        links.push({
          entity_type: 'project',
          entity_id: project.id,
          label: project.name,
          confidence: input.projectId ? 90 : 60,
          method: 'context_hint',
        });
      }
    }

    const workflowLinks = await this.resolveWorkflowLinks(
      documentType,
      metadata,
      input,
      context.combinedText,
    );
    links.push(...workflowLinks);

    if (documentType === 'sds' && metadata.product_name && input.companyId) {
      const sds = await this.prisma.sdsDocument.findFirst({
        where: {
          companyId: input.companyId,
          deletedAt: null,
          productName: {
            contains: metadata.product_name.slice(0, 40),
            mode: 'insensitive',
          },
        },
        select: { id: true, productName: true },
      });
      if (sds) {
        links.push({
          entity_type: 'sds',
          entity_id: sds.id,
          label: sds.productName,
          confidence: 78,
          method: 'product_name_match',
        });
      }
    }

    if (metadata.training_type) {
      const cert = await this.prisma.certification.findFirst({
        where: {
          OR: [
            { name: { contains: metadata.training_type, mode: 'insensitive' } },
            {
              code: {
                contains: metadata.certification_code ?? metadata.training_type,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: { id: true, name: true, code: true },
      });
      if (cert) {
        links.push({
          entity_type: 'certification',
          entity_id: cert.id,
          label: cert.name,
          confidence: 72,
          method: 'certification_match',
        });
      }
    }

    return this.dedupeLinks(links).slice(0, 12);
  }

  private async resolveWorkerLink(
    metadata: DocumentIntelligenceMetadata,
    input: DocumentIntelligenceAiInput,
  ): Promise<DocumentAutoLink | null> {
    if (!metadata.worker_name) return null;
    const parts = metadata.worker_name.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const [firstName, ...rest] = parts;
    const lastName = rest.join(' ');

    const worker = await this.prisma.worker.findFirst({
      where: {
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' },
        ...(input.companyId ? { companyId: input.companyId } : {}),
      },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!worker) return null;

    return {
      entity_type: 'worker',
      entity_id: worker.id,
      label: `${worker.firstName} ${worker.lastName}`.trim(),
      confidence: 82,
      method: 'name_match',
    };
  }

  private async resolveCompanyLink(
    metadata: DocumentIntelligenceMetadata,
    input: DocumentIntelligenceAiInput,
  ): Promise<DocumentAutoLink | null> {
    if (input.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: input.companyId },
        select: { id: true, name: true },
      });
      if (company) {
        return {
          entity_type: 'company',
          entity_id: company.id,
          label: company.name,
          confidence: 92,
          method: 'context_hint',
        };
      }
    }

    if (!metadata.company) return null;

    const company = await this.prisma.company.findFirst({
      where: {
        name: { contains: metadata.company.slice(0, 48), mode: 'insensitive' },
      },
      select: { id: true, name: true },
    });
    if (!company) return null;

    return {
      entity_type: 'company',
      entity_id: company.id,
      label: company.name,
      confidence: 70,
      method: 'company_name_match',
    };
  }

  private async resolveTrainingRecordLink(
    existingLinks: DocumentAutoLink[],
    metadata: DocumentIntelligenceMetadata,
    input: DocumentIntelligenceAiInput,
  ): Promise<DocumentAutoLink | null> {
    const workerLink = existingLinks.find((l) => l.entity_type === 'worker');
    const workerId =
      workerLink && typeof workerLink.entity_id === 'number'
        ? workerLink.entity_id
        : input.workerId;
    if (!workerId || !metadata.training_type) return null;

    const record = await this.prisma.trainingRecord.findFirst({
      where: {
        workerId,
        certification: {
          OR: [
            { name: { contains: metadata.training_type, mode: 'insensitive' } },
            ...(metadata.certification_code
              ? [
                  {
                    code: {
                      contains: metadata.certification_code,
                      mode: 'insensitive' as const,
                    },
                  },
                ]
              : []),
          ],
        },
      },
      orderBy: { issuedAt: 'desc' },
      include: {
        certification: { select: { name: true } },
      },
    });

    if (!record) return null;

    return {
      entity_type: 'training_record',
      entity_id: record.id,
      label: record.certification.name,
      confidence: 76,
      method: 'certification_match',
    };
  }

  private async resolveWorkflowLinks(
    documentType: DocumentIntelligenceType,
    metadata: DocumentIntelligenceMetadata,
    input: DocumentIntelligenceAiInput,
    text: string,
  ): Promise<DocumentAutoLink[]> {
    if (!input.projectId || !input.companyId) return [];
    if (
      documentType !== 'jha_flha' &&
      documentType !== 'sif_heca' &&
      documentType !== 'permit' &&
      documentType !== 'training_certificate' &&
      documentType !== 'training_proof'
    ) {
      return [];
    }

    const keywords = [
      metadata.training_type,
      metadata.permit_type,
      metadata.product_name,
      ...text
        .split(/\s+/)
        .filter((w) => w.length > 4)
        .slice(0, 8),
    ].filter(Boolean) as string[];

    const workflows = await this.prisma.jhaFlha.findMany({
      where: {
        projectId: input.projectId,
        companyId: input.companyId,
        deletedAt: null,
        status: { in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, kind: true, taskDescription: true, status: true },
    });

    return workflows
      .filter((w) => {
        const hay = w.taskDescription.toLowerCase();
        return keywords.some((kw) =>
          hay.includes(kw.toLowerCase().slice(0, 24)),
        );
      })
      .map((w) => ({
        entity_type: 'jha_flha' as const,
        entity_id: w.id,
        label: `${w.kind} — ${w.taskDescription.slice(0, 48)}`,
        confidence: 65,
        method: 'workflow_keyword_match',
      }));
  }

  private buildRecommendedActions(
    documentType: DocumentIntelligenceType,
    metadata: DocumentIntelligenceMetadata,
    authenticity: { score: number; indicators: AuthenticityIndicator[] },
    links: DocumentAutoLink[],
  ): DocumentRecommendedAction[] {
    const actions: DocumentRecommendedAction[] = [];

    if (
      !links.some((l) => l.entity_type === 'worker') &&
      metadata.worker_name
    ) {
      actions.push({
        action: `Link document to worker profile for ${metadata.worker_name}`,
        priority: 'high',
        reason: 'Worker name extracted but no confident profile match',
      });
    }

    if (
      (documentType === 'training_certificate' ||
        documentType === 'training_proof') &&
      !links.some((l) => l.entity_type === 'training_record')
    ) {
      actions.push({
        action:
          'Create or update training record from extracted certificate data',
        priority: 'high',
        reason: 'Training evidence should populate Core training wallet',
      });
    }

    if (
      documentType === 'safety_program' ||
      documentType === 'policy' ||
      documentType === 'equipment_manual'
    ) {
      actions.push({
        action:
          'Open Safety Program Ingestion for schema-validated extract and human confirm before write-back',
        priority: 'high',
        reason:
          'Route to /core/safety-program-ingest or /pm/safety-program-ingest (API /api/v1/safety-program-ingestion)',
      });
    }

    if (authenticity.score < 60) {
      actions.push({
        action: 'Route to verifier for manual authenticity review',
        priority: 'high',
        reason: `Authenticity score ${authenticity.score}/100 below threshold`,
      });
    }

    if (authenticity.indicators.some((i) => i.signal.includes('expired'))) {
      actions.push({
        action: 'Reject or quarantine expired document; request renewal',
        priority: 'high',
        reason: 'Expiry date is in the past',
      });
    }

    if (documentType === 'sds' && !links.some((l) => l.entity_type === 'sds')) {
      actions.push({
        action:
          'Register SDS in document control and require worker acknowledgment',
        priority: 'medium',
        reason: 'No matching published SDS found',
      });
    }

    if (documentType === 'insurance' || documentType === 'wcb_clearance') {
      actions.push({
        action:
          'Attach to contractor compliance package for project gate review',
        priority: 'medium',
        reason: 'Insurance/WCB documents affect contractor prequalification',
      });
    }

    if (links.some((l) => l.entity_type === 'jha_flha')) {
      actions.push({
        action: 'Attach as evidence on matched JHA/FLHA workflow',
        priority: 'medium',
        reason: 'Document content aligns with active field hazard analysis',
      });
    }

    if (!metadata.provider && documentType.startsWith('training')) {
      actions.push({
        action: 'Capture training provider for verification chain',
        priority: 'low',
        reason: 'Provider not detected in OCR text',
      });
    }

    return actions.slice(0, 8);
  }

  private computeConfidenceScore(
    metadata: DocumentIntelligenceMetadata,
    indicators: AuthenticityIndicator[],
    links: DocumentAutoLink[],
  ): number {
    const fieldKeys = [
      'worker_name',
      'company',
      'training_type',
      'issue_date',
      'expiry_date',
      'provider',
      'certificate_number',
    ] as const;
    const filled = fieldKeys.filter((k) => metadata[k]).length;
    let score = 30 + filled * 8;

    if (links.length) score += Math.min(20, links.length * 5);
    if (indicators.some((i) => i.impact === 'negative')) score -= 8;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private buildFieldSummary(
    core: DocumentIntelligenceAiJson,
    confidence: number,
  ): string {
    const parts = [
      `Classified as ${core.document_type.replace(/_/g, ' ')}.`,
      `Extracted ${Object.keys(core.metadata).length} metadata field(s).`,
      `Authenticity ${core.authenticity_score}/100 · confidence ${confidence}/100.`,
    ];
    if (core.auto_links.length) {
      parts.push(`${core.auto_links.length} auto-link(s) suggested.`);
    }
    if (core.recommended_actions.filter((a) => a.priority === 'high').length) {
      parts.push('High-priority follow-up actions required.');
    }
    return parts.join(' ');
  }

  private parseDate(value: string): Date | null {
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (iso) {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const slash = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (slash) {
      const year =
        slash[3].length === 2
          ? 2000 + parseInt(slash[3], 10)
          : parseInt(slash[3], 10);
      const d = new Date(
        year,
        parseInt(slash[1], 10) - 1,
        parseInt(slash[2], 10),
      );
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  private dedupeLinks(links: DocumentAutoLink[]): DocumentAutoLink[] {
    const seen = new Set<string>();
    const out: DocumentAutoLink[] = [];
    for (const link of links) {
      const key = `${link.entity_type}:${link.entity_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(link);
    }
    return out;
  }
}
