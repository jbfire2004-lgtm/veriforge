import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import type {
  EventTransport,
  PublishedMessage,
} from './event-transport.interface';

/**
 * Minimal NATS PUB client (no external dependency).
 * Configure: NATS_URL=nats://localhost:4222
 */
@Injectable()
export class NatsEventTransport implements EventTransport {
  readonly name = 'nats';
  private readonly logger = new Logger(NatsEventTransport.name);

  isEnabled(): boolean {
    return Boolean(process.env.NATS_URL?.trim());
  }

  async publish(message: PublishedMessage): Promise<void> {
    const url = process.env.NATS_URL?.trim();
    if (!url) return;

    const parsed = this.parseUrl(url);
    const body = JSON.stringify({
      outboxId: message.outboxId,
      topic: message.topic,
      event: message.event,
    });
    const payload = new Uint8Array(Buffer.from(body, 'utf8'));

    await new Promise<void>((resolve, reject) => {
      const socket = net.connect(parsed.port, parsed.host);
      const fail = (err: Error) => {
        socket.destroy();
        reject(err);
      };

      socket.setTimeout(8_000, () => fail(new Error('NATS connect timeout')));
      socket.once('error', fail);

      socket.once('connect', () => {
        const connect =
          'CONNECT {"verbose":false,"pedantic":false,"tls_required":false,"name":"vera-event-bus"}\r\n';
        const pub = `PUB ${message.natsSubject} ${payload.length}\r\n`;
        socket.write(connect);
        socket.write(pub);
        socket.write(payload);
        socket.write('\r\n');
        socket.end();
        resolve();
      });
    });

    this.logger.debug(
      `NATS PUB ${message.natsSubject} outbox=${message.outboxId}`,
    );
  }

  private parseUrl(raw: string): { host: string; port: number } {
    try {
      const u = new URL(raw);
      return {
        host: u.hostname || 'localhost',
        port: Number(u.port || 4222),
      };
    } catch {
      return { host: 'localhost', port: 4222 };
    }
  }
}
