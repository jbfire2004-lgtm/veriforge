import { Injectable } from '@nestjs/common';
import { VeraVisionEngine } from '@vera/vision';
import { PrismaService } from '../../prisma/prisma.service';
import { TtlCache } from '../../common/ttl-cache';
import type {
  AnalyzeDocumentDto,
  VisionAnalysisResult,
  VisionDashboardBundle,
} from './vision.types';
import {
  attachAnalysisMeta,
  resolveVisionCapabilities,
  type VisionAnalysisMode,
  type VisionCapabilities,
} from './vision-capabilities';

type VisionCandidates = {
  workers: Array<{ id: string; name: string }>;
  equipment: Array<{ id: string; name: string; serial?: string }>;
  providers: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
  companies: Array<{ id: string; name: string }>;
};

@Injectable()
export class VisionService {
  private readonly vve = new VeraVisionEngine();
  private readonly recentByCompany = new Map<number, VisionAnalysisResult[]>();
  private readonly candidatesCache = new TtlCache<VisionCandidates>(
    Number(process.env.VERA_VISION_CANDIDATES_TTL_MS ?? 60_000),
    200,
  );

  constructor(private readonly prisma: PrismaService) {}

  getCapabilities(ocrTextProvided = false): VisionCapabilities {
    return resolveVisionCapabilities({
      ocrTextProvided,
      llmConfigured: Boolean(
        process.env.OPENAI_API_KEY?.trim() ||
          process.env.VERA_LLM_API_KEY?.trim() ||
          process.env.ANTHROPIC_API_KEY?.trim(),
      ),
      ocrDisabledByEnv: process.env.VERA_VISION_OCR_ENABLED === 'false',
      externalOcrUrl: process.env.VERA_OCR_SERVICE_URL ?? null,
    });
  }

  async analyze(dto: AnalyzeDocumentDto): Promise<
    VisionAnalysisResult & {
      analysisMode: VisionAnalysisMode;
      capabilities: VisionCapabilities;
    }
  > {
    const capabilities = this.getCapabilities(!!dto.ocrText?.trim());
    const candidates = await this.loadCandidates(dto.companyId);

    const fallbackText =
      dto.ocrText?.trim() ||
      dto.imageHints?.hazards?.join('. ') ||
      'Document image — enable OCR text or LLM for richer extraction.';

    const result = await this.vve.analyze({
      documentType: dto.documentType,
      ocrText: capabilities.ocrEnabled ? fallbackText : fallbackText,
      ocrBlocks: dto.ocrBlocks,
      imageHints: dto.imageHints,
      candidates,
      offline: dto.offline,
    });

    const withMeta = attachAnalysisMeta(
      result,
      capabilities.recommendedMode,
      capabilities,
    );

    if (dto.companyId) {
      const list = this.recentByCompany.get(dto.companyId) ?? [];
      list.unshift(withMeta);
      this.recentByCompany.set(dto.companyId, list.slice(0, 50));
    }

    return withMeta;
  }

  async analyzeCertificate(dto: Omit<AnalyzeDocumentDto, 'documentType'>) {
    return this.analyze({ ...dto, documentType: 'training_certificate' });
  }

  async analyzeInspection(dto: Omit<AnalyzeDocumentDto, 'documentType'>) {
    return this.analyze({ ...dto, documentType: 'inspection_form' });
  }

  async analyzeEquipmentPlate(dto: Omit<AnalyzeDocumentDto, 'documentType'>) {
    return this.analyze({ ...dto, documentType: 'equipment_plate' });
  }

  getDashboard(companyId?: number): VisionDashboardBundle {
    const recent = companyId ? this.recentByCompany.get(companyId) ?? [] : [];
    return this.vve.buildDashboard(recent);
  }

  private async loadCandidates(companyId?: number) {
    const cacheKey = `candidates:${companyId ?? 'global'}`;
    return this.candidatesCache.getOrSet(cacheKey, async () => {
      const workers = await this.prisma.worker.findMany({
        where: companyId ? { companyId } : {},
        take: 100,
        select: { id: true, firstName: true, lastName: true },
      });
      const equipment = await this.prisma.equipment.findMany({
        where: companyId ? { companyId } : {},
        take: 100,
        select: { id: true, name: true, serialNumber: true, assetTag: true },
      });
      const providers = await this.prisma.provider.findMany({
        take: 50,
        select: { id: true, name: true },
      });
      const projects = companyId
        ? await this.prisma.project.findMany({
            where: { companyId },
            take: 30,
            select: { id: true, name: true },
          })
        : [];
      const certifications = await this.prisma.certification.findMany({
        take: 80,
        select: { id: true, name: true },
      });

      return {
        workers: workers.map((w) => ({
          id: String(w.id),
          name: `${w.firstName} ${w.lastName}`.trim(),
        })),
        equipment: equipment.map((e) => ({
          id: String(e.id),
          name: e.name,
          serial: e.serialNumber ?? e.assetTag ?? undefined,
        })),
        providers: providers.map((p) => ({ id: String(p.id), name: p.name })),
        projects: projects.map((p) => ({ id: String(p.id), name: p.name })),
        courses: certifications.map((c) => ({
          id: String(c.id),
          name: c.name,
        })),
        companies: companyId
          ? [{ id: String(companyId), name: `Company ${companyId}` }]
          : [],
      };
    });
  }
}
