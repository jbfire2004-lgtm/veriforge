import {
  connect,
  type NatsConnection,
  type Subscription,
  StringCodec,
  JSONCodec,
} from 'nats';

export interface DomainEvent<T = Record<string, unknown>> {
  name: string;
  companyId: string;
  aggregateId: string;
  occurredAt: string;
  payload: T;
  metadata?: Record<string, unknown>;
}

export interface EventBusOptions {
  servers?: string;
  serviceName: string;
  enabled?: boolean;
}

const sc = StringCodec();
const jc = JSONCodec();

export class VeraEventBus {
  private nc: NatsConnection | null = null;
  private readonly enabled: boolean;
  private readonly servers: string;
  private readonly serviceName: string;

  constructor(opts: EventBusOptions) {
    this.servers = opts.servers ?? process.env.NATS_URL ?? 'nats://localhost:4222';
    this.serviceName = opts.serviceName;
    this.enabled = opts.enabled !== false && process.env.EVENT_BUS_ENABLED !== 'false';
  }

  async connect(): Promise<void> {
    if (!this.enabled || this.nc) return;
    this.nc = await connect({ servers: this.servers, name: this.serviceName });
  }

  async publish(subject: string, event: DomainEvent): Promise<void> {
    if (!this.enabled) return;
    await this.connect();
    if (!this.nc) return;
    const enriched: DomainEvent = {
      ...event,
      metadata: { ...event.metadata, publisher: this.serviceName },
    };
    this.nc.publish(subject, jc.encode(enriched));
  }

  async subscribe(
    subject: string,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<Subscription | null> {
    if (!this.enabled) return null;
    await this.connect();
    if (!this.nc) return null;
    const sub = this.nc.subscribe(subject);
    (async () => {
      for await (const msg of sub) {
        try {
          const event = jc.decode(msg.data) as DomainEvent;
          await handler(event);
        } catch {
          /* handler errors logged by caller */
        }
      }
    })();
    return sub;
  }

  async drain(): Promise<void> {
    if (this.nc) {
      await this.nc.drain();
      this.nc = null;
    }
  }

  isConnected(): boolean {
    return this.nc !== null && !this.nc.isClosed();
  }

  static subjectForEvent(name: string): string {
    return name.replace(/\./g, '.');
  }
}

export function createEventBus(opts: EventBusOptions): VeraEventBus {
  return new VeraEventBus(opts);
}

export { sc, jc };
