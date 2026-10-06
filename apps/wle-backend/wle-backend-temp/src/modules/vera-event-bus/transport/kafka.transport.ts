import { Injectable, Logger } from '@nestjs/common';
import type {
  EventTransport,
  PublishedMessage,
} from './event-transport.interface';

type KafkaProducer = {
  connect: () => Promise<void>;
  send: (args: {
    topic: string;
    messages: Array<{
      key?: string;
      value: string;
      headers?: Record<string, string>;
    }>;
  }) => Promise<unknown>;
  disconnect: () => Promise<void>;
};

/**
 * Kafka transport via kafkajs (optional peer).
 * Configure: KAFKA_BROKERS=localhost:9092,KAFKA_CLIENT_ID=vera-api
 */
@Injectable()
export class KafkaEventTransport implements EventTransport {
  readonly name = 'kafka';
  private readonly logger = new Logger(KafkaEventTransport.name);
  private producer: KafkaProducer | null = null;
  private connecting: Promise<void> | null = null;

  isEnabled(): boolean {
    return Boolean(process.env.KAFKA_BROKERS?.trim());
  }

  async publish(message: PublishedMessage): Promise<void> {
    if (!this.isEnabled()) return;
    await this.ensureProducer();

    const value = JSON.stringify({
      outboxId: message.outboxId,
      event: message.event,
    });

    await this.producer!.send({
      topic: message.topic,
      messages: [
        {
          key: message.partitionKey,
          value,
          headers: {
            'event-name': message.event.name,
            'occurred-at': message.event.occurredAt,
          },
        },
      ],
    });

    this.logger.debug(
      `Kafka send ${message.topic} key=${message.partitionKey}`,
    );
  }

  private async ensureProducer(): Promise<void> {
    if (this.producer) return;
    if (this.connecting) {
      await this.connecting;
      return;
    }

    this.connecting = (async () => {
      const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092')
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);

      let Kafka: new (args: { clientId: string; brokers: string[] }) => {
        producer: () => KafkaProducer;
      };
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('kafkajs') as {
          Kafka: typeof Kafka;
        };
        Kafka = mod.Kafka;
      } catch {
        throw new Error('kafkajs is not installed — run: npm install kafkajs');
      }

      const kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID ?? 'vera-event-bus',
        brokers,
      });
      const producer = kafka.producer();
      await producer.connect();
      this.producer = producer;
    })();

    try {
      await this.connecting;
    } finally {
      this.connecting = null;
    }
  }
}
