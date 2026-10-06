import { Injectable } from '@nestjs/common';
import { AssignmentStatus, UserLocationSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type ActiveUserLocation = {
  lat: number;
  lng: number;
  source: 'gps' | 'worksite' | 'primary';
};

const GPS_MAX_AGE_MS = 30 * 60 * 1000;

@Injectable()
export class UserLocationResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserActiveLocation(
    userId: number,
  ): Promise<ActiveUserLocation | null> {
    const worksite = await this.resolveWorksite(userId);
    if (worksite) return worksite;

    const gps = await this.resolveGps(userId);
    if (gps) return gps;

    return this.resolvePrimary(userId);
  }

  async recordLocation(
    userId: number,
    lat: number,
    lng: number,
    source: UserLocationSource,
  ) {
    return this.prisma.userLocationHistory.create({
      data: { userId, lat, lng, source },
    });
  }

  private async resolveWorksite(
    userId: number,
  ): Promise<ActiveUserLocation | null> {
    const worker = await this.prisma.worker.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!worker) return null;

    const assignment = await this.prisma.projectAssignment.findFirst({
      where: {
        workerId: worker.id,
        status: AssignmentStatus.ACTIVE,
        endedAt: null,
      },
      orderBy: { assignedAt: 'desc' },
      include: {
        project: {
          include: { site: { select: { latitude: true, longitude: true } } },
        },
      },
    });

    const lat = assignment?.project.site?.latitude;
    const lng = assignment?.project.site?.longitude;
    if (lat == null || lng == null) return null;

    return { lat, lng, source: 'worksite' };
  }

  private async resolveGps(userId: number): Promise<ActiveUserLocation | null> {
    const since = new Date(Date.now() - GPS_MAX_AGE_MS);
    const row = await this.prisma.userLocationHistory.findFirst({
      where: {
        userId,
        source: UserLocationSource.GPS,
        updatedAt: { gte: since },
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (!row) return null;
    return { lat: row.lat, lng: row.lng, source: 'gps' };
  }

  private async resolvePrimary(
    userId: number,
  ): Promise<ActiveUserLocation | null> {
    const prefs = await this.prisma.userHomepagePreferences.findUnique({
      where: { userId },
    });
    if (prefs?.primaryLatitude != null && prefs?.primaryLongitude != null) {
      return {
        lat: prefs.primaryLatitude,
        lng: prefs.primaryLongitude,
        source: 'primary',
      };
    }

    if (prefs?.region) {
      const zone = await this.prisma.weatherZoneMap.findFirst({
        where: { province: { equals: prefs.region, mode: 'insensitive' } },
      });
      if (zone?.polygon) {
        const center = centroidFromPolygon(
          zone.polygon as { coordinates: unknown },
        );
        if (center) {
          return { lat: center[1], lng: center[0], source: 'primary' };
        }
      }
    }

    return null;
  }
}

function centroidFromPolygon(polygon: {
  coordinates: unknown;
}): [number, number] | null {
  const coords = polygon.coordinates;
  if (!Array.isArray(coords) || !coords[0]?.[0]) return null;
  const ring = coords[0] as number[][];
  if (!ring.length) return null;
  let sumLng = 0;
  let sumLat = 0;
  let n = 0;
  for (const pt of ring) {
    if (pt.length >= 2) {
      sumLng += pt[0];
      sumLat += pt[1];
      n++;
    }
  }
  if (!n) return null;
  return [sumLng / n, sumLat / n];
}
