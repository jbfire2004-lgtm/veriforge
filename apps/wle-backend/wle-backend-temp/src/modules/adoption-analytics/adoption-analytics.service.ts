import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdoptionAnalyticsCacheService } from './adoption-analytics-cache.service';

@Injectable()
export class AdoptionAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AdoptionAnalyticsCacheService,
  ) {}

  getAdoptionMap() {
    return this.cache.wrap('adoption:map', async () => {
      const rows = await this.prisma.company.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          province: true,
          lat: true,
          lng: true,
          createdAt: true,
          companyAnalytics: true,
        },
        orderBy: { name: 'asc' },
      });

      return rows.map((c) => ({
        id: c.id,
        name: c.name,
        city: c.city,
        province: c.province,
        lat: c.lat,
        lng: c.lng,
        createdAt: c.createdAt.toISOString(),
        analytics: c.companyAnalytics
          ? {
              lastLogin: c.companyAnalytics.lastLogin?.toISOString() ?? null,
              activeUsers30d: c.companyAnalytics.activeUsers30d,
              modulesUsed: c.companyAnalytics.modulesUsed,
              totalWorkers: c.companyAnalytics.totalWorkers,
              totalEquipment: c.companyAnalytics.totalEquipment,
              totalProjects: c.companyAnalytics.totalProjects,
              churnRiskScore: c.companyAnalytics.churnRiskScore,
            }
          : null,
      }));
    });
  }

  getGrowthStats() {
    return this.cache.wrap('adoption:growth', async () => {
      const [companies, workers, projects] = await Promise.all([
        this.prisma.company.findMany({
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.companyLink.findMany({
          select: { startDate: true },
          orderBy: { startDate: 'asc' },
        }),
        this.prisma.project.findMany({
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      return {
        newCompaniesByMonth: bucketByMonth(companies.map((c) => c.createdAt)),
        newWorkersByMonth: bucketByMonth(workers.map((w) => w.startDate)),
        newProjectsByMonth: bucketByMonth(projects.map((p) => p.createdAt)),
      };
    });
  }

  getModuleUsage() {
    return this.cache.wrap('adoption:modules', async () => {
      const analytics = await this.prisma.companyAnalytics.findMany({
        include: {
          company: { select: { id: true, name: true } },
        },
      });

      const globalTotals: Record<string, number> = {};
      const companies = analytics.map((a) => {
        const modules = (a.modulesUsed ?? {}) as Record<string, number>;
        for (const [k, v] of Object.entries(modules)) {
          globalTotals[k] = (globalTotals[k] ?? 0) + v;
        }
        return {
          companyId: a.companyId,
          companyName: a.company.name,
          modulesUsed: modules,
          activeUsers30d: a.activeUsers30d,
          churnRiskScore: a.churnRiskScore,
        };
      });

      const moduleKeys = Object.keys(globalTotals);
      const companiesUsingModule: Record<string, number> = {};
      for (const key of moduleKeys) {
        companiesUsingModule[key] = companies.filter(
          (c) => (c.modulesUsed[key] ?? 0) > 0,
        ).length;
      }

      const totalCompanies = await this.prisma.company.count();

      return {
        globalTotals,
        companiesUsingModule,
        totalCompanies,
        moduleAdoptionPercent: Object.fromEntries(
          Object.entries(companiesUsingModule).map(([k, n]) => [
            k,
            totalCompanies > 0 ? Math.round((n / totalCompanies) * 100) : 0,
          ]),
        ),
        companies,
      };
    });
  }
}

function bucketByMonth(dates: Date[]): { month: string; count: number }[] {
  const map = new Map<string, number>();
  for (const d of dates) {
    const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      '0',
    )}`;
    map.set(month, (map.get(month) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}
