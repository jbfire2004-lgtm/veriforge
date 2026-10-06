import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FallClearanceEquipmentStatus,
  type FallClearanceEquipmentProfile,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ClearanceParamsDto,
  CreateEquipmentDto,
} from './dto/configuration-instance.dto';
import { EquipmentManualAiParserService } from './equipment-manual-ai-parser.service';

export type ClearanceParams = ClearanceParamsDto;

export type FallArrestEquipment = {
  id: string;
  type: string;
  manufacturer: string;
  model: string;
  standardRefs: string[];
  clearanceParams: ClearanceParams;
  rawManualData: string | null;
  status: FallClearanceEquipmentStatus;
  createdAt: Date;
  updatedAt: Date;
};

const DEFAULT_PARAMS: ClearanceParams = {
  maxFreeFallM: 1.8,
  decelerationDistanceM: 1.07,
  harnessStretchM: 0.3,
  lifelinePayoutM: 0,
  anchorDeflectionM: 0.15,
  safetyMarginM: 0.9,
};

@Injectable()
export class EquipmentCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiParser: EquipmentManualAiParserService,
  ) {}

  /** SELECT profiles — default APPROVED only; pass allStatuses for library admin. */
  async list(options?: {
    includeAllStatuses?: boolean;
  }): Promise<FallArrestEquipment[]> {
    const rows = await this.prisma.fallClearanceEquipmentProfile.findMany({
      where: options?.includeAllStatuses
        ? undefined
        : { status: FallClearanceEquipmentStatus.APPROVED },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => this.toDto(r));
  }

  async approve(id: string): Promise<FallArrestEquipment> {
    return this.setStatus(id, FallClearanceEquipmentStatus.APPROVED);
  }

  async reject(id: string): Promise<FallArrestEquipment> {
    return this.setStatus(id, FallClearanceEquipmentStatus.REJECTED);
  }

  private async setStatus(
    id: string,
    status: FallClearanceEquipmentStatus,
  ): Promise<FallArrestEquipment> {
    const existing = await this.prisma.fallClearanceEquipmentProfile.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Equipment profile not found: ${id}`);
    }
    const row = await this.prisma.fallClearanceEquipmentProfile.update({
      where: { id },
      data: { status },
    });
    return this.toDto(row);
  }

  async get(id: string): Promise<FallArrestEquipment> {
    const row = await this.prisma.fallClearanceEquipmentProfile.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException(`Equipment profile not found: ${id}`);
    }
    return this.toDto(row);
  }

  async create(body: CreateEquipmentDto): Promise<FallArrestEquipment> {
    const row = await this.prisma.fallClearanceEquipmentProfile.create({
      data: {
        type: body.type,
        manufacturer: body.manufacturer,
        model: body.model,
        standardRefs: body.standardRefs ?? [],
        clearanceParams: body.clearanceParams as unknown as Prisma.InputJsonValue,
        rawManualData: body.rawManualData ?? null,
        status: FallClearanceEquipmentStatus.DRAFT,
      },
    });
    return this.toDto(row);
  }

  /** AI parse manual → update clearance_params, status = PENDING_REVIEW */
  async ingestManual(
    id: string,
    text: string,
  ): Promise<{
    equipment: FallArrestEquipment;
    extracted: Partial<ClearanceParams>;
    warnings: string[];
    confidence: number;
  }> {
    if (!text?.trim()) {
      throw new BadRequestException('Manual text is required');
    }

    const existing = await this.prisma.fallClearanceEquipmentProfile.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Equipment profile not found: ${id}`);
    }

    const parsed = await this.aiParser.parseManualText(text);
    const current = this.parseParams(existing.clearanceParams);
    const merged: ClearanceParams = { ...current, ...parsed.clearanceParams };

    const row = await this.prisma.fallClearanceEquipmentProfile.update({
      where: { id },
      data: {
        rawManualData: text.trim().slice(0, 50_000),
        clearanceParams: merged as unknown as Prisma.InputJsonValue,
        status: FallClearanceEquipmentStatus.PENDING_REVIEW,
      },
    });

    return {
      equipment: this.toDto(row),
      extracted: parsed.clearanceParams,
      warnings: parsed.warnings,
      confidence: parsed.confidence,
    };
  }

  private toDto(row: FallClearanceEquipmentProfile): FallArrestEquipment {
    return {
      id: row.id,
      type: row.type,
      manufacturer: row.manufacturer,
      model: row.model,
      standardRefs: row.standardRefs,
      clearanceParams: this.parseParams(row.clearanceParams),
      rawManualData: row.rawManualData,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private parseParams(value: Prisma.JsonValue): ClearanceParams {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { ...DEFAULT_PARAMS };
    }
    const o = value as Record<string, unknown>;
    return {
      maxFreeFallM: num(o.maxFreeFallM, DEFAULT_PARAMS.maxFreeFallM),
      decelerationDistanceM: num(
        o.decelerationDistanceM,
        DEFAULT_PARAMS.decelerationDistanceM,
      ),
      harnessStretchM: num(o.harnessStretchM, DEFAULT_PARAMS.harnessStretchM),
      lifelinePayoutM: num(o.lifelinePayoutM, DEFAULT_PARAMS.lifelinePayoutM),
      anchorDeflectionM: num(
        o.anchorDeflectionM,
        DEFAULT_PARAMS.anchorDeflectionM,
      ),
      safetyMarginM: num(o.safetyMarginM, DEFAULT_PARAMS.safetyMarginM),
    };
  }
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
