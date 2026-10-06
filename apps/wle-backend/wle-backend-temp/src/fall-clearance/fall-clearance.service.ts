import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  FallClearanceWorksheetStatus,
  Prisma,
  type FallClearanceWorksheet,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EquipmentCatalogService } from './equipment-catalog.service';
import { StandardsLibraryService } from './standards-library.service';
import type { ClearanceParamsDto } from './dto/configuration-instance.dto';
import type {
  SaveWorksheetDto,
  WorksheetGeometryDto,
  WorksheetRecordDto,
} from './dto/worksheet.dto';

export const WORKSHEET_DISCLAIMER =
  'Clearance worksheet — reference values only. Not a design calculation. Confirm against manufacturer instructions and applicable standards (CSA / ANSI / OSHA / site procedures). Vera does not determine fall clearance adequacy or authorize work.';

@Injectable()
export class FallClearanceService {
  constructor(
    private readonly equipmentService: EquipmentCatalogService,
    private readonly standardsService: StandardsLibraryService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Persist a user-owned clearance worksheet.
   * Vera never asserts PASS/WARNING/FAIL — only stores user figures + acknowledgment.
   */
  async saveWorksheet(dto: SaveWorksheetDto): Promise<WorksheetRecordDto> {
    if (!dto.acknowledged) {
      throw new BadRequestException(
        'Acknowledgment is required before saving a clearance worksheet',
      );
    }
    if (!dto.acknowledgedBy?.trim()) {
      throw new BadRequestException(
        'acknowledgedBy is required when saving a worksheet',
      );
    }

    if (dto.equipmentId) {
      await this.equipmentService.get(dto.equipmentId);
    }

    const userLineSubtotalM = sumUserLines(dto.userParams);
    const now = new Date();

    const data = {
      companyId: dto.companyId ?? null,
      projectId: dto.projectId ?? null,
      industry: dto.industry ?? null,
      equipmentId: dto.equipmentId ?? null,
      referenceParams: dto.referenceParams as unknown as Prisma.InputJsonValue,
      userParams: dto.userParams as unknown as Prisma.InputJsonValue,
      geometry: (dto.geometry ?? {}) as unknown as Prisma.InputJsonValue,
      userRequiredM:
        dto.userRequiredM != null
          ? new Prisma.Decimal(dto.userRequiredM)
          : null,
      userAvailableM:
        dto.userAvailableM != null
          ? new Prisma.Decimal(dto.userAvailableM)
          : null,
      userLineSubtotalM: new Prisma.Decimal(userLineSubtotalM),
      userNotes: dto.userNotes?.trim() || null,
      status: FallClearanceWorksheetStatus.SAVED,
      acknowledgedAt: now,
      acknowledgedBy: dto.acknowledgedBy.trim(),
    };

    let row: FallClearanceWorksheet;
    if (dto.id) {
      const existing = await this.prisma.fallClearanceWorksheet.findUnique({
        where: { id: dto.id },
      });
      if (!existing) {
        throw new NotFoundException(`Worksheet not found: ${dto.id}`);
      }
      row = await this.prisma.fallClearanceWorksheet.update({
        where: { id: dto.id },
        data,
      });
    } else {
      row = await this.prisma.fallClearanceWorksheet.create({ data });
    }

    await this.prisma.fallClearanceAuditLog.create({
      data: {
        payload: {
          kind: 'worksheet_save',
          worksheetId: row.id,
          companyId: row.companyId,
          projectId: row.projectId,
          industry: row.industry,
          equipmentId: row.equipmentId,
          userLineSubtotalM,
          userRequiredM: dto.userRequiredM ?? null,
          userAvailableM: dto.userAvailableM ?? null,
          acknowledgedBy: dto.acknowledgedBy.trim(),
          disclaimer: WORKSHEET_DISCLAIMER,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    return this.toWorksheetDto(row);
  }

  async getWorksheet(id: string): Promise<WorksheetRecordDto> {
    const row = await this.prisma.fallClearanceWorksheet.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException(`Worksheet not found: ${id}`);
    }
    return this.toWorksheetDto(row);
  }

  async listWorksheets(filters: {
    companyId?: number;
    projectId?: number;
  }): Promise<WorksheetRecordDto[]> {
    const rows = await this.prisma.fallClearanceWorksheet.findMany({
      where: {
        ...(filters.companyId != null
          ? { companyId: filters.companyId }
          : {}),
        ...(filters.projectId != null
          ? { projectId: filters.projectId }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => this.toWorksheetDto(r));
  }

  getDisclaimer(): string {
    return WORKSHEET_DISCLAIMER;
  }

  getStandardsBasis() {
    return this.standardsService.getBasisForCalculation();
  }

  private toWorksheetDto(row: FallClearanceWorksheet): WorksheetRecordDto {
    return {
      id: row.id,
      companyId: row.companyId,
      projectId: row.projectId,
      industry: row.industry,
      equipmentId: row.equipmentId,
      referenceParams: parseParams(row.referenceParams),
      userParams: parseParams(row.userParams),
      geometry: parseGeometry(row.geometry),
      userRequiredM: dec(row.userRequiredM),
      userAvailableM: dec(row.userAvailableM),
      userLineSubtotalM: dec(row.userLineSubtotalM),
      userNotes: row.userNotes,
      status: row.status,
      acknowledgedAt: row.acknowledgedAt?.toISOString() ?? null,
      acknowledgedBy: row.acknowledgedBy,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      disclaimer: WORKSHEET_DISCLAIMER,
    };
  }
}

export function sumUserLines(params: ClearanceParamsDto): number {
  return round3(
    params.maxFreeFallM +
      params.decelerationDistanceM +
      params.harnessStretchM +
      params.lifelinePayoutM +
      params.anchorDeflectionM +
      params.safetyMarginM,
  );
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function dec(v: Prisma.Decimal | null): number | null {
  if (v == null) return null;
  return Number(v);
}

function parseParams(value: Prisma.JsonValue): ClearanceParamsDto {
  const o =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    maxFreeFallM: num(o.maxFreeFallM),
    decelerationDistanceM: num(o.decelerationDistanceM),
    harnessStretchM: num(o.harnessStretchM),
    lifelinePayoutM: num(o.lifelinePayoutM),
    anchorDeflectionM: num(o.anchorDeflectionM),
    safetyMarginM: num(o.safetyMarginM),
  };
}

function parseGeometry(value: Prisma.JsonValue): WorksheetGeometryDto {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const o = value as Record<string, unknown>;
  return {
    ...(o.anchorHeightM != null ? { anchorHeightM: num(o.anchorHeightM) } : {}),
    ...(o.workSurfaceHeightM != null
      ? { workSurfaceHeightM: num(o.workSurfaceHeightM) }
      : {}),
    ...(o.horizontalOffsetM != null
      ? { horizontalOffsetM: num(o.horizontalOffsetM) }
      : {}),
    ...(o.workerMassKg != null ? { workerMassKg: num(o.workerMassKg) } : {}),
    ...(typeof o.environment === 'string'
      ? { environment: o.environment as WorksheetGeometryDto['environment'] }
      : {}),
  };
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
