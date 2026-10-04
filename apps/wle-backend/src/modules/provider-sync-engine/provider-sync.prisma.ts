import type { PrismaService } from '../../prisma/prisma.service';

export type ProviderSyncConfigRow = {
  id: number;
  providerId: number;
  syncMode: string;
  pollUrl: string | null;
  pollIntervalMinutes: number;
  apiKeyEnvVar: string | null;
  webhookSecret: string | null;
  enabled: boolean;
  lastPollAt: Date | null;
  lastSyncAt: Date | null;
};

export type ProviderSyncRunRow = {
  id: number;
  providerId: number;
  status: string;
  recordsFetched?: number | null;
  recordsVerified?: number | null;
  recordsPushed?: number | null;
  errorMessage?: string | null;
  details?: unknown;
  completedAt?: Date | null;
};

type ProviderSyncConfigDelegate = {
  upsert: (args: Record<string, unknown>) => Promise<ProviderSyncConfigRow>;
  findUnique: (
    args: Record<string, unknown>,
  ) => Promise<ProviderSyncConfigRow | null>;
  findMany: (args: Record<string, unknown>) => Promise<ProviderSyncConfigRow[]>;
  update: (args: Record<string, unknown>) => Promise<ProviderSyncConfigRow>;
  updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
};

type ProviderSyncRunDelegate = {
  create: (args: Record<string, unknown>) => Promise<ProviderSyncRunRow>;
  findUnique: (
    args: Record<string, unknown>,
  ) => Promise<ProviderSyncRunRow | null>;
  update: (args: Record<string, unknown>) => Promise<ProviderSyncRunRow>;
};

export function providerSyncConfigDelegate(
  prisma: PrismaService,
): ProviderSyncConfigDelegate {
  return (
    prisma as unknown as { providerSyncConfig: ProviderSyncConfigDelegate }
  ).providerSyncConfig;
}

export function providerSyncRunDelegate(
  prisma: PrismaService,
): ProviderSyncRunDelegate {
  return (prisma as unknown as { providerSyncRun: ProviderSyncRunDelegate })
    .providerSyncRun;
}
