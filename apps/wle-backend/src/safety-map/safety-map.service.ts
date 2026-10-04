import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Matches admin safety map default center (Saskatoon area). */
const MAP_CENTER = { lat: 52.326, lng: -106.584 };

function offsetLatLng(id: number, salt: number): { lat: number; lng: number } {
  const a = ((id * 9301 + 49297 + salt * 17) % 233280) / 233280;
  const b = ((id * 7919 + salt * 31) % 233280) / 233280;
  return {
    lat: MAP_CENTER.lat + (a - 0.5) * 0.045,
    lng: MAP_CENTER.lng + (b - 0.5) * 0.065,
  };
}

export type MapWorkerDto = {
  id: number;
  lat: number;
  lng: number;
  firstName: string;
  lastName: string;
  lastScan: string;
};

export type MapEquipmentDto = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  isSafe: boolean;
};

export type MapStationDto = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  isOnline: boolean;
  mode: string;
  lastHeartbeat: string;
};

export type MapIncidentDto = {
  id: number;
  lat: number;
  lng: number;
  type: string;
  category?: string | null;
  createdAt: string;
};

@Injectable()
export class SafetyMapService {
  constructor(private readonly prisma: PrismaService) {}

  async listWorkersForMap(): Promise<MapWorkerDto[]> {
    const workers = await this.prisma.worker.findMany({
      orderBy: { id: 'asc' },
      take: 200,
    });
    const signoffs = await this.prisma.digitalSignoff.findMany({
      where: { workerId: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 2000,
      select: { workerId: true, createdAt: true },
    });
    const lastByWorker = new Map<number, Date>();
    for (const s of signoffs) {
      if (s.workerId != null && !lastByWorker.has(s.workerId)) {
        lastByWorker.set(s.workerId, s.createdAt);
      }
    }
    return workers.map((w) => {
      const { lat, lng } = offsetLatLng(w.id, 1);
      const last = lastByWorker.get(w.id);
      return {
        id: w.id,
        lat,
        lng,
        firstName: w.firstName,
        lastName: w.lastName,
        lastScan: (last ?? new Date(0)).toISOString(),
      };
    });
  }

  async listEquipmentForMap(): Promise<MapEquipmentDto[]> {
    const rows = await this.prisma.equipment.findMany({
      orderBy: { id: 'asc' },
      take: 200,
    });
    return rows.map((e) => {
      const { lat, lng } = offsetLatLng(e.id, 2);
      return {
        id: e.id,
        lat,
        lng,
        name: e.name,
        isSafe: e.safetyStatus === 'OK',
      };
    });
  }

  async listStationsForMap(): Promise<MapStationDto[]> {
    const rows = await this.prisma.safetyStation.findMany({
      orderBy: { id: 'asc' },
      take: 100,
    });
    const now = Date.now();
    return rows.map((s) => {
      const { lat, lng } = offsetLatLng(s.id, 3);
      const lastPingMs = s.lastPing ? s.lastPing.getTime() : 0;
      const isOnline = s.active && now - lastPingMs < 120_000;
      return {
        id: s.id,
        lat,
        lng,
        name: s.name,
        isOnline,
        mode: s.type === 'HARDWARE' ? 'hardware' : 'standard',
        lastHeartbeat: (s.lastPing ?? s.createdAt).toISOString(),
      };
    });
  }

  async listIncidentsForMap(): Promise<MapIncidentDto[]> {
    const rows = await this.prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 80,
    });
    return rows.map((i) => {
      const { lat, lng } =
        i.latitude != null && i.longitude != null
          ? { lat: i.latitude, lng: i.longitude }
          : offsetLatLng(i.id, 4);
      const label = i.category ?? i.title ?? 'Incident';
      return {
        id: i.id,
        lat,
        lng,
        type: label,
        category: i.category,
        createdAt: i.createdAt.toISOString(),
      };
    });
  }

  /** Latest incident id (for detecting new rows between polls). */
  async maxIncidentId(): Promise<number> {
    const row = await this.prisma.incident.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    return row?.id ?? 0;
  }

  async listIncidentsNewerThan(minId: number): Promise<MapIncidentDto[]> {
    const rows = await this.prisma.incident.findMany({
      where: { id: { gt: minId } },
      orderBy: { id: 'asc' },
      take: 50,
    });
    return rows.map((i) => {
      const { lat, lng } =
        i.latitude != null && i.longitude != null
          ? { lat: i.latitude, lng: i.longitude }
          : offsetLatLng(i.id, 4);
      const label = i.category ?? i.title ?? 'Incident';
      return {
        id: i.id,
        lat,
        lng,
        type: label,
        category: i.category,
        createdAt: i.createdAt.toISOString(),
      };
    });
  }
}
