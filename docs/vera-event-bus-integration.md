# Vera Event Bus — Integration Guide

## Overview

Vera uses a **hybrid event bus**:

1. **In-process** — `EventBusService` (Node `EventEmitter`) for same-process subscribers
2. **Transactional outbox** — PostgreSQL `event_outbox` for durable delivery
3. **External transports** — NATS (built-in minimal client) and Kafka (via `kafkajs`)

Every `events.emit()` call is logged, metered, persisted to the outbox (unless disabled), and delivered to in-process handlers immediately.

## Supported flows

| Flow | Domain event | Kafka/NATS topic |
|------|--------------|------------------|
| Worker training completed | `worker.training.completed` | `vera.training` |
| Training verified | `training.verified` | `vera.training` |
| Credential minted | `training.credential.minted` | `vera.training` |
| Wallet updated | `wallet.updated` | `vera.wallet` |
| Company updated | `company.updated` | `vera.company` |
| Project updated | `project.updated` | `vera.project` |
| Provider sync | `provider.sync.event` | `vera.provider` |
| Expiry approaching | `training.expiry.approaching` | `vera.expiry` |
| Expiry passed | `training.expiry.passed` | `vera.expiry` |
| Worker assigned | `worker.assigned.project` | `vera.project` |
| Worker removed | `worker.removed.project` | `vera.project` |
| Union hall roster | `union.hall.roster_update` | `vera.union` |

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `VERA_EVENT_OUTBOX` | enabled | Set `0` to disable outbox persistence |
| `NATS_URL` | — | e.g. `nats://localhost:4222` |
| `KAFKA_BROKERS` | — | e.g. `localhost:9092` |
| `KAFKA_CLIENT_ID` | `vera-event-bus` | Kafka producer client id |

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/event-bus/health` | Public | Transport + outbox status |
| `GET` | `/api/v1/event-bus/metrics` | Admin | Emit/publish/DLQ counters |
| `GET` | `/api/v1/event-bus/topics` | Admin | Topic map |
| `GET` | `/api/v1/event-bus/dlq` | Admin | Recent dead-letter rows |

## Publishing from code

```typescript
import { EventBusService } from '@/modules/api-platform/events/event-bus.service';
import { workerTrainingCompletedEvent } from '@/modules/vera-event-bus';

this.events.emit(
  workerTrainingCompletedEvent({
    trainingRecordId: 42,
    workerId: 7,
    companyId: 1,
  }),
);
```

## Subscribers

Flow subscribers in `backend/src/modules/vera-event-bus/subscribers/`:

- `TrainingFlowSubscriber`
- `WalletFlowSubscriber`
- `ExpiryFlowSubscriber`
- `ProjectAssignmentSubscriber`
- `ProviderSyncSubscriber`
- `UnionHallSubscriber`

Each uses **retry with exponential backoff** (3 attempts) and structured logging on failure.

## Outbox + retry + DLQ

1. `EventBusService.emit()` → `EventOutboxService.enqueue()`
2. `EventBusScheduler` (every 30s) → `EventPublisherService.publishPendingBatch()`
3. Publishes to NATS + Kafka when configured
4. On failure: exponential backoff up to 5 attempts
5. After max attempts: `EventDlqService.moveFromOutbox()` → `event_dead_letter`

## NATS subject format

```
vera.<domain>.<event_name_with_underscores>
```

Example: `vera.training.training_verified`

## Kafka message format

- **Topic**: `vera.training`, `vera.wallet`, etc.
- **Key**: `company:{id}` or `project:{id}` for partition affinity
- **Value**: JSON `{ outboxId, event }`
- **Headers**: `event-name`, `occurred-at`

## Monitoring

`EventBusMetricsService` tracks:

- `emitted`, `enqueued`, `published`, `publishFailed`, `dlq`, `consumerErrors`
- Per-event counts in `byEvent`

Heartbeat logs every 5 minutes: `type: event_bus.metrics`

## Database

Migration: `20260609120000_vera_event_bus`

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## External consumer example (NATS)

Subscribe to `vera.training.>` and parse:

```json
{
  "outboxId": "uuid",
  "topic": "vera.training",
  "event": {
    "name": "training.verified",
    "occurredAt": "2026-06-09T12:00:00.000Z",
    "companyId": 1,
    "entityType": "training_record",
    "entityId": 42,
    "data": { "workerId": 7, "overallStatus": "VERIFIED" }
  }
}
```

## Kafka dependency

`kafkajs` is included in `backend/package.json`. Set `KAFKA_BROKERS` to activate the producer; without brokers the outbox still drains in-process only.

## Tests

```bash
cd backend
npx jest src/modules/vera-event-bus --runInBand
```

Covers topic mapping, outbox enqueue, publisher retry/DLQ, and emit→outbox integration.

## Related

- [Training Verification Engine](./training-verification-engine-integration.md)
- [Worker Wallet & Provider Sync](./worker-wallet-provider-sync-integration.md)
