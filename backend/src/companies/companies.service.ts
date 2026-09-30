import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';

export type CompanyActor = { id: number; role: string };

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private readonly monitoring: Phase1MonitoringService,
    @Optional() private readonly events?: EventBusService,
  ) {}

  /**
   * List companies. Workers only see their own employer (workspace `/companies`).
   */
  async findAll(actor: CompanyActor) {
    if (actor.role === UserRole.WORKER) {
      const worker = await this.prisma.worker.findFirst({
        where: { userId: actor.id },
        include: { company: true },
      });
      if (!worker?.company) {
        return [];
      }
      const c = worker.company;
      return [
        {
          id: c.id,
          name: c.name,
          logoUrl: c.logoUrl,
          createdAt: c.createdAt,
        },
      ];
    }

    return this.prisma.company.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Full company graph. Workers may only read their own `companyId`.
   */
  async findOne(id: number, actor: CompanyActor) {
    if (actor.role === UserRole.WORKER) {
      const worker = await this.prisma.worker.findFirst({
        where: { userId: actor.id },
        select: { companyId: true },
      });
      if (!worker?.companyId || worker.companyId !== id) {
        throw new ForbiddenException(
          'You may only view your employer organization.',
        );
      }
    }
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        workers: {
          include: {
            trainingRecords: { include: { certification: true } },
            credentials: { include: { certification: true } },
            incidents: true,
          },
        },
        equipment: {
          include: {
            incidents: true,
          },
        },
        documents: true,
        incidents: true,
      },
    });

    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async create(dto: CreateCompanyDto) {
    const created = await this.prisma.company.create({
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl ?? null,
      },
    });
    this.monitoring.processing('companies', 'company.create', {
      companyId: created.id,
    });
    await this.monitoring.persistAudit({
      action: 'company.create',
      entity: 'Company',
      entityId: created.id,
      metadata: { name: dto.name },
    });
    await this.prisma.companyAnalytics
      .create({ data: { companyId: created.id } })
      .catch(() => undefined);
    return created;
  }

  async update(id: number, dto: UpdateCompanyDto) {
    const existing = await this.prisma.company.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Company not found');

    const updated = await this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        logoUrl: dto.logoUrl ?? existing.logoUrl,
      },
    });
    this.monitoring.processing('companies', 'company.update', {
      companyId: id,
    });
    await this.monitoring.persistAudit({
      action: 'company.update',
      entity: 'Company',
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });

    this.events?.emit({
      name: DomainEvent.COMPANY_UPDATED,
      occurredAt: new Date().toISOString(),
      companyId: id,
      entityType: 'company',
      entityId: id,
      data: { fields: Object.keys(dto) },
    });

    return updated;
  }

  async remove(id: number) {
    const existing = await this.prisma.company.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Company not found');

    await this.prisma.company.delete({ where: { id } });
    this.monitoring.processing('companies', 'company.delete', {
      companyId: id,
    });
    await this.monitoring.persistAudit({
      action: 'company.delete',
      entity: 'Company',
      entityId: id,
      metadata: { name: existing.name },
    });
    return { status: 'ok', deletedId: id };
  }

  async complianceSummary(id: number, actor?: CompanyActor) {
    if (actor?.role === UserRole.WORKER) {
      const worker = await this.prisma.worker.findFirst({
        where: { userId: actor.id },
        select: { companyId: true },
      });
      if (!worker?.companyId || worker.companyId !== id) {
        throw new ForbiddenException(
          'You may only view compliance for your employer organization.',
        );
      }
    }
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        workers: {
          include: {
            trainingRecords: { include: { certification: true } },
            credentials: { include: { certification: true } },
            incidents: true,
          },
        },
        equipment: {
          include: {
            incidents: true,
          },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    const now = new Date();

    const expiredTraining: any[] = [];
    const expiredCredentials: any[] = [];
    const workerIncidents: any[] = [];
    const equipmentIncidents: any[] = [];

    for (const worker of company.workers) {
      expiredTraining.push(
        ...worker.trainingRecords.filter(
          (t) => t.expiresAt && t.expiresAt <= now,
        ),
      );

      expiredCredentials.push(
        ...worker.credentials.filter((c) => c.expiresAt && c.expiresAt <= now),
      );

      if (worker.incidents.length > 0) {
        workerIncidents.push(...worker.incidents);
      }
    }

    for (const eq of company.equipment) {
      if (eq.incidents.length > 0) {
        equipmentIncidents.push(...eq.incidents);
      }
    }

    const next30 = new Date();
    next30.setDate(now.getDate() + 30);

    const expiringSoonTraining: typeof expiredTraining = [];
    for (const worker of company.workers) {
      for (const t of worker.trainingRecords) {
        if (t.expiresAt && t.expiresAt > now && t.expiresAt <= next30) {
          expiringSoonTraining.push(t);
        }
      }
    }

    const isCompliant =
      expiredTraining.length === 0 &&
      expiredCredentials.length === 0 &&
      workerIncidents.length === 0 &&
      equipmentIncidents.length === 0;

    return {
      companyId: company.id,
      companyName: company.name,
      expiredTrainingCount: expiredTraining.length,
      expiringTrainingCount: expiringSoonTraining.length,
      expiredCredentialsCount: expiredCredentials.length,
      workerIncidentsCount: workerIncidents.length,
      equipmentIncidentsCount: equipmentIncidents.length,
      status: isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
    };
  }

  async analytics(id: number) {
    const now = new Date();
    const next30 = new Date();
    next30.setDate(now.getDate() + 30);

    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        workers: {
          include: {
            trainingRecords: { include: { certification: true } },
            credentials: { include: { certification: true } },
            incidents: true,
          },
        },
        equipment: {
          include: {
            incidents: true,
          },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    const workerIncidents = company.workers.flatMap((w) => w.incidents);
    const equipmentIncidents = company.equipment.flatMap((e) => e.incidents);

    const expiredTraining = company.workers.filter((w) =>
      w.trainingRecords.some(
        (t) => t.expiresAt && new Date(t.expiresAt) <= now,
      ),
    ).length;

    const expiredCredentials = company.workers.filter((w) =>
      w.credentials.some((c) => c.expiresAt && new Date(c.expiresAt) <= now),
    ).length;

    const expiringSoon = company.workers.filter((w) =>
      w.trainingRecords.some(
        (t) =>
          t.expiresAt &&
          new Date(t.expiresAt) > now &&
          new Date(t.expiresAt) <= next30,
      ),
    ).length;

    const months: string[] = [];
    const incidentTrend: number[] = [];
    const expiryTrend: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      months.push(month.toLocaleString('default', { month: 'short' }));

      incidentTrend.push(
        workerIncidents.filter(
          (inc) =>
            new Date(inc.createdAt) >= month &&
            new Date(inc.createdAt) < nextMonth,
        ).length +
          equipmentIncidents.filter(
            (inc) =>
              new Date(inc.createdAt) >= month &&
              new Date(inc.createdAt) < nextMonth,
          ).length,
      );

      expiryTrend.push(
        company.workers.filter((w) =>
          w.trainingRecords.some(
            (t) =>
              t.expiresAt &&
              new Date(t.expiresAt) >= month &&
              new Date(t.expiresAt) < nextMonth,
          ),
        ).length,
      );
    }

    return {
      totalWorkers: company.workers.length,
      expiredTraining,
      expiredCredentials,
      expiringSoon,
      workerIncidents: workerIncidents.length,
      equipmentIncidents: equipmentIncidents.length,
      months,
      incidentTrend,
      expiryTrend,
    };
  }
}
