import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export interface CertificationRecord {
  id: string;
  workerId: number;
  certType: string;
  certificationName: string;
  expiresAt: Date | null;
  companyId: number | null;
}

interface CertificationRow {
  id: string | number;
  workerId: number;
  certType: string | null;
  expiresAt: Date | null;
  companyId: number | null;
}

/**
 * Adapter over the certifications table. Uses raw SQL so the engine is decoupled
 * from the certification model's exact Prisma shape (adjust column names here if
 * the schema differs: worker_id / cert_type / expires_at / company_id).
 */
@Injectable()
export class CertificationService {
  private readonly logger = new Logger(CertificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getActiveCertifications(): Promise<CertificationRecord[]> {
    return this.query(Prisma.sql`
      SELECT id AS "id", worker_id AS "workerId", cert_type AS "certType",
             expires_at AS "expiresAt", company_id AS "companyId"
      FROM certifications
      WHERE expires_at IS NOT NULL AND worker_id IS NOT NULL
    `);
  }

  async getWorkerCertifications(
    workerId: number,
  ): Promise<CertificationRecord[]> {
    return this.query(Prisma.sql`
      SELECT id AS "id", worker_id AS "workerId", cert_type AS "certType",
             expires_at AS "expiresAt", company_id AS "companyId"
      FROM certifications
      WHERE worker_id = ${workerId}
      ORDER BY expires_at ASC
    `);
  }

  async getCertificationById(id: string): Promise<CertificationRecord | null> {
    const rows = await this.query(Prisma.sql`
      SELECT id AS "id", worker_id AS "workerId", cert_type AS "certType",
             expires_at AS "expiresAt", company_id AS "companyId"
      FROM certifications
      WHERE id::text = ${id}
      LIMIT 1
    `);
    return rows[0] ?? null;
  }

  private async query(sql: Prisma.Sql): Promise<CertificationRecord[]> {
    try {
      const rows = await this.prisma.$queryRaw<CertificationRow[]>(sql);
      return rows.map((row) => ({
        id: String(row.id),
        workerId: Number(row.workerId),
        certType: row.certType ?? 'UNKNOWN',
        certificationName: row.certType ?? 'Certification',
        expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
        companyId: row.companyId ?? null,
      }));
    } catch (error) {
      this.logger.error(
        `Certification query failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }
  }
}
