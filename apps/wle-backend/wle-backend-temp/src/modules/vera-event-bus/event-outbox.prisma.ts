import type { PrismaService } from '../../prisma/prisma.service';

export type EventOutboxRow = {
  id: string;
  eventName: string;
  topic: string;
  natsSubject: string;
  partitionKey: string | null;
  payload: unknown;
  status: string;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  publishedAt: Date | null;
  nextRetryAt: Date | null;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EventDeadLetterRow = {
  id: string;
  outboxId: string | null;
  eventName: string;
  topic: string;
  payload: unknown;
  errorMessage: string;
  attempts: number;
  consumerGroup: string | null;
  createdAt: Date;
};

type OutboxDelegate = {
  create: (args: { data: Record<string, unknown> }) => Promise<EventOutboxRow>;
  findMany: (args: Record<string, unknown>) => Promise<EventOutboxRow[]>;
  update: (args: Record<string, unknown>) => Promise<EventOutboxRow>;
  updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
  count: (args?: Record<string, unknown>) => Promise<number>;
};

type DlqDelegate = {
  create: (args: {
    data: Record<string, unknown>;
  }) => Promise<EventDeadLetterRow>;
  findMany: (args: Record<string, unknown>) => Promise<EventDeadLetterRow[]>;
};

export function eventOutboxDelegate(prisma: PrismaService): OutboxDelegate {
  return (prisma as unknown as { eventOutbox: OutboxDelegate }).eventOutbox;
}

export function eventDeadLetterDelegate(prisma: PrismaService): DlqDelegate {
  return (prisma as unknown as { eventDeadLetter: DlqDelegate })
    .eventDeadLetter;
}
