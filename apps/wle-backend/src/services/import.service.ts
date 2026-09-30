import { OrientationStatus, Prisma } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { prisma } from "../lib/prisma";

type WorkerCsvRow = {
  firstName?: string;
  lastName?: string;
  companyId?: string;
  orientationStatus?: string;
  orientationDate?: string;
};

type ParsedWorker = {
  firstName: string;
  lastName: string;
  companyId: string;
  orientationStatus: OrientationStatus;
  orientationDate: Date | null;
};

const ORIENTATION_MAP: Record<string, OrientationStatus> = {
  valid: OrientationStatus.valid,
  expired: OrientationStatus.expired,
  missing: OrientationStatus.missing,
};

export class ImportService {
  parseCSV(fileBuffer: Buffer): ParsedWorker[] {
    const rows = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as WorkerCsvRow[];

    return rows.map((row, idx) => this.mapRow(row, idx + 2));
  }

  async createWorkersInBulk(rows: ParsedWorker[]) {
    if (rows.length === 0) {
      return { createdCount: 0 };
    }

    const data: Prisma.WorkerCreateManyInput[] = rows.map((row) => ({
      firstName: row.firstName,
      lastName: row.lastName,
      companyId: row.companyId,
      orientationStatus: row.orientationStatus,
      orientationDate: row.orientationDate,
    }));

    const result = await prisma.worker.createMany({ data });
    return { createdCount: result.count };
  }

  async importWorkers(fileBuffer: Buffer) {
    const parsed = this.parseCSV(fileBuffer);
    const created = await this.createWorkersInBulk(parsed);

    return {
      importedCount: created.createdCount,
      receivedRows: parsed.length,
    };
  }

  private mapRow(row: WorkerCsvRow, rowNumber: number): ParsedWorker {
    const firstName = (row.firstName ?? "").trim();
    const lastName = (row.lastName ?? "").trim();
    const companyId = (row.companyId ?? "").trim();
    const orientationRaw = (row.orientationStatus ?? "missing").trim().toLowerCase();
    const orientationStatus = ORIENTATION_MAP[orientationRaw];

    if (!firstName) {
      throw new Error(`Row ${rowNumber}: firstName is required`);
    }
    if (!lastName) {
      throw new Error(`Row ${rowNumber}: lastName is required`);
    }
    if (!companyId) {
      throw new Error(`Row ${rowNumber}: companyId is required`);
    }
    if (!orientationStatus) {
      throw new Error(
        `Row ${rowNumber}: orientationStatus must be one of valid, expired, missing`,
      );
    }

    let orientationDate: Date | null = null;
    const dateRaw = (row.orientationDate ?? "").trim();
    if (dateRaw) {
      const parsedDate = new Date(dateRaw);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error(`Row ${rowNumber}: orientationDate is invalid`);
      }
      orientationDate = parsedDate;
    }

    return {
      firstName,
      lastName,
      companyId,
      orientationStatus,
      orientationDate,
    };
  }
}
