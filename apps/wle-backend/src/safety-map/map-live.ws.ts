import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { WebSocket, WebSocketServer } from 'ws';
import { SafetyMapService } from './safety-map.service';

const PATH = '/map/live';

function pathnameFromRequest(req: IncomingMessage): string {
  try {
    const host = req.headers.host ?? 'localhost';
    return new URL(req.url ?? '/', `http://${host}`).pathname;
  } catch {
    return '';
  }
}

@Injectable()
export class MapLiveWsBootstrap implements OnModuleInit, OnModuleDestroy {
  private wss: WebSocketServer | null = null;
  private upgradeListener:
    | ((request: IncomingMessage, socket: Duplex, head: Buffer) => void)
    | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private lastIncidentId = 0;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly safetyMap: SafetyMapService,
  ) {}

  onModuleInit() {
    const httpServer = this.httpAdapterHost.httpAdapter.getHttpServer();

    this.wss = new WebSocketServer({ noServer: true });

    this.upgradeListener = (
      request: IncomingMessage,
      socket: Duplex,
      head: Buffer,
    ) => {
      if (pathnameFromRequest(request) !== PATH) {
        return;
      }
      this.wss!.handleUpgrade(request, socket, head, (client) => {
        this.wss!.emit('connection', client, request);
      });
    };

    httpServer.on('upgrade', this.upgradeListener);

    this.wss.on('connection', (socket: WebSocket) => {
      socket.on('error', () => undefined);
      if (this.wss!.clients.size === 1) {
        void this.broadcastTick();
      }
    });

    void this.safetyMap.maxIncidentId().then((id) => {
      this.lastIncidentId = id;
    });

    this.interval = setInterval(() => void this.broadcastTick(), 12_000);
  }

  onModuleDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    const httpServer = this.httpAdapterHost.httpAdapter?.getHttpServer?.();
    if (httpServer && this.upgradeListener) {
      httpServer.off('upgrade', this.upgradeListener);
    }
    this.upgradeListener = null;
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }

  private broadcastJson(obj: unknown) {
    if (!this.wss) return;
    const raw = JSON.stringify(obj);
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    }
  }

  private async broadcastTick() {
    if (!this.wss || this.wss.clients.size === 0) {
      return;
    }

    try {
      const [workers, equipment, stations, maxId] = await Promise.all([
        this.safetyMap.listWorkersForMap(),
        this.safetyMap.listEquipmentForMap(),
        this.safetyMap.listStationsForMap(),
        this.safetyMap.maxIncidentId(),
      ]);

      for (const w of workers) {
        this.broadcastJson({ type: 'worker-update', ...w });
      }
      for (const e of equipment) {
        this.broadcastJson({ type: 'equipment-update', ...e });
      }
      for (const s of stations) {
        this.broadcastJson({ type: 'station-update', ...s });
      }

      if (maxId > this.lastIncidentId) {
        const fresh = await this.safetyMap.listIncidentsNewerThan(
          this.lastIncidentId,
        );
        for (const inc of fresh) {
          this.broadcastJson({
            msgType: 'incident',
            ...inc,
          });
        }
        this.lastIncidentId = maxId;
      }
    } catch {
      // Prisma / DB errors should not crash the process
    }
  }
}
