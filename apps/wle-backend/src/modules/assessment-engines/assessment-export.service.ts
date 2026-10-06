import { Injectable, NotFoundException } from '@nestjs/common';
import { VeraAssessmentEngine } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildTextPdfBuffer } from '../../common/pdf/build-text-pdf';
import type { TaeAssessmentResult } from '../training-assessment/training-assessment.types';
import type { SpceAssessmentResult } from '../safety-program-compliance/safety-program-compliance.types';
import type { SgaeAssessmentResult } from '../smart-gap-analysis/smart-gap-analysis.types';

@Injectable()
export class AssessmentExportService {
  constructor(private readonly prisma: PrismaService) {}

  async trainingPdf(workerId: number): Promise<Buffer> {
    const run = await this.prisma.veraAssessmentRun.findFirst({
      where: { workerId, engine: VeraAssessmentEngine.TRAINING_ASSESSMENT },
      orderBy: { evaluatedAt: 'desc' },
    });
    if (!run) throw new NotFoundException('No training assessment on file');

    const result = run.resultJson as unknown as TaeAssessmentResult;
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { firstName: true, lastName: true },
    });

    const lines = [
      `Worker: ${worker ? `${worker.firstName} ${worker.lastName}` : workerId}`,
      `Status: ${result.overallStatus} · Score ${result.overallScore}/100`,
      `Evaluated: ${run.evaluatedAt.toISOString()}`,
      '',
      'Requirements:',
      ...result.requirementResults.map(
        (r) =>
          `- ${r.name}: ${r.status} (${r.score}) [${r.validityStatus}, ${r.competencyStatus}]`,
      ),
      '',
      'Corrective actions:',
      ...(result.correctiveActions.length
        ? result.correctiveActions.map(
            (c) => `- [${c.priority}] ${c.description}`,
          )
        : ['- None']),
    ];

    return buildTextPdfBuffer({
      title: 'VERA Training Assessment Report',
      subtitle: `Run ${run.id}`,
      lines,
    });
  }

  async spcePdf(companyId: number): Promise<Buffer> {
    const run = await this.prisma.veraAssessmentRun.findFirst({
      where: {
        companyId,
        engine: VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
      },
      orderBy: { evaluatedAt: 'desc' },
    });
    if (!run) throw new NotFoundException('No SPCE assessment on file');

    const result = run.resultJson as unknown as SpceAssessmentResult;
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    const lines = [
      `Company: ${company?.name ?? companyId}`,
      `Status: ${result.overallStatus} · Score ${result.overallScore}/100`,
      '',
      ...result.requirementResults
        .slice(0, 40)
        .map((r) => `- ${r.type} ${r.category}: ${r.status} (${r.score})`),
    ];

    return buildTextPdfBuffer({
      title: 'VERA Safety Program Compliance Report',
      lines,
    });
  }

  async smartGapPdf(companyId: number, projectId?: number): Promise<Buffer> {
    const run = await this.prisma.veraAssessmentRun.findFirst({
      where: {
        companyId,
        projectId: projectId ?? undefined,
        engine: VeraAssessmentEngine.SMART_GAP_ANALYSIS,
      },
      orderBy: { evaluatedAt: 'desc' },
    });
    if (!run) throw new NotFoundException('No smart gap assessment on file');

    const result = run.resultJson as unknown as SgaeAssessmentResult;
    const lines = [
      `Gap score: ${result.overallGapScore} · ${result.overallStatus}`,
      '',
      'Category scores:',
      ...Object.entries(result.categoryScores).map(
        ([k, v]) =>
          `- ${k}: ${v}${
            result.categoryNotes[k as keyof typeof result.categoryNotes]
              ? ` (${
                  result.categoryNotes[k as keyof typeof result.categoryNotes]
                })`
              : ''
          }`,
      ),
      '',
      'Roadmap:',
      ...result.correctiveActionRoadmap
        .slice(0, 15)
        .map((i) => `- [${i.priority}] ${i.description}`),
    ];

    return buildTextPdfBuffer({
      title: 'VERA Smart Gap Analysis Report',
      lines,
    });
  }
}
