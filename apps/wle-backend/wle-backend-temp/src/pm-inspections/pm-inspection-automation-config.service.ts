import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG } from './pm-inspections.constants';

@Injectable()
export class PmInspectionAutomationConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async isAutoFailureMeetingEnabled(companyId: number): Promise<boolean> {
    return this.isTenantFeatureEnabled(
      companyId,
      PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG,
    );
  }

  private async isTenantFeatureEnabled(
    companyId: number,
    featureKey: string,
  ): Promise<boolean> {
    const flag = await this.prisma.acpFeatureFlag.findUnique({
      where: { key: featureKey },
    });
    if (!flag) return true;

    const tenant = await this.prisma.acpTenant.findFirst({
      where: { companyId },
      include: {
        tenantFeatureFlags: {
          where: { featureFlagId: flag.id },
          take: 1,
        },
      },
    });

    if (!tenant) {
      return flag.defaultEnabled;
    }

    const override = tenant.tenantFeatureFlags[0];
    return override?.enabled ?? flag.defaultEnabled;
  }
}
