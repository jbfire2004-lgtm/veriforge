import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { FeedRealtimeEvent } from '@vera/api-contract';
import jwt from 'jsonwebtoken';
import { resolveJwtSecret } from '../../auth/jwt-secret.util';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';

type Client = { ws: WebSocket; userId: number };

/**
 * Lightweight WebSocket gateway for feed updates.
 * Clients connect to /feed/live?token=<jwt> (validated in attach).
 */
@Injectable()
export class FeedRealtimeGateway implements OnModuleDestroy {
  private readonly logger = new Logger(FeedRealtimeGateway.name);
  private wss: WebSocketServer | null = null;
  private readonly clients = new Set<Client>();

  attach(server: import('http').Server): void {
    if (this.wss) return;
    this.wss = new WebSocketServer({ noServer: true });
    server.on('upgrade', (req, socket, head) => {
      if (!req.url?.startsWith('/feed/live')) return;
      this.wss!.handleUpgrade(req, socket, head, (ws) => {
        const userId = this.resolveUserId(req);
        if (!userId) {
          ws.close(4401, 'Unauthorized');
          return;
        }
        const client: Client = { ws, userId };
        this.clients.add(client);
        ws.on('close', () => this.clients.delete(client));
        ws.send(JSON.stringify({ type: 'feed.connected' }));
      });
    });
    this.logger.log('Feed realtime gateway attached at /feed/live');
  }

  broadcast(userId: number, event: FeedRealtimeEvent): void {
    const payload = JSON.stringify(event);
    for (const c of this.clients) {
      if (c.userId === userId && c.ws.readyState === WebSocket.OPEN) {
        c.ws.send(payload);
      }
    }
  }

  broadcastAll(event: FeedRealtimeEvent): void {
    const payload = JSON.stringify(event);
    for (const c of this.clients) {
      if (c.ws.readyState === WebSocket.OPEN) c.ws.send(payload);
    }
  }

  onModuleDestroy(): void {
    this.wss?.close();
    this.clients.clear();
  }

  private resolveUserId(req: IncomingMessage): number | null {
    try {
      const url = new URL(req.url ?? '', 'http://localhost');
      const token = url.searchParams.get('token');
      if (!token) return null;
      const payload = jwt.verify(
        token,
        resolveJwtSecret(),
      ) as jwt.JwtPayload & { sub: number };
      return Number(payload.sub);
    } catch {
      return null;
    }
  }
}
