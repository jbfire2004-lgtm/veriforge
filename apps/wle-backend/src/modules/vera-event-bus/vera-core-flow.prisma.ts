import type { PrismaService } from '../../prisma/prisma.service';

type WalletBundleDelegate = {
  findFirst: (args: Record<string, unknown>) => Promise<{ id: string } | null>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
};

type ProviderSyncConfigDelegate = {
  updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
};

type CompanyUsageDailyDelegate = {
  upsert: (args: Record<string, unknown>) => Promise<unknown>;
};

export function workerWalletBundleDelegate(
  prisma: PrismaService,
): WalletBundleDelegate {
  return (prisma as unknown as { workerWalletBundle: WalletBundleDelegate })
    .workerWalletBundle;
}

export function providerSyncConfigDelegate(
  prisma: PrismaService,
): ProviderSyncConfigDelegate {
  return (
    prisma as unknown as { providerSyncConfig: ProviderSyncConfigDelegate }
  ).providerSyncConfig;
}

export function companyUsageDailyDelegate(
  prisma: PrismaService,
): CompanyUsageDailyDelegate {
  return (prisma as unknown as { companyUsageDaily: CompanyUsageDailyDelegate })
    .companyUsageDaily;
}
