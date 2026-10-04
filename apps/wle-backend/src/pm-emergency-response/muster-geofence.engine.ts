export type GeoPoint = { lat: number; lng: number };

export type MusterPoint = {
  code: string;
  label: string;
  lat: number;
  lng: number;
  radiusMeters?: number;
};

export class MusterGeofenceEngine {
  /** Haversine distance in meters */
  distanceMeters(a: GeoPoint, b: GeoPoint): number {
    const R = 6371000;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  nearestMusterPoint(
    workerLocation: GeoPoint,
    points: MusterPoint[],
  ): { point: MusterPoint; distanceMeters: number } | null {
    if (!points.length) return null;
    let best = points[0];
    let bestDist = this.distanceMeters(workerLocation, {
      lat: best.lat,
      lng: best.lng,
    });
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const d = this.distanceMeters(workerLocation, { lat: p.lat, lng: p.lng });
      if (d < bestDist) {
        best = p;
        bestDist = d;
      }
    }
    return { point: best, distanceMeters: bestDist };
  }

  isInsideMusterGeofence(
    workerLocation: GeoPoint,
    point: MusterPoint,
  ): boolean {
    const radius = point.radiusMeters ?? 75;
    return (
      this.distanceMeters(workerLocation, {
        lat: point.lat,
        lng: point.lng,
      }) <= radius
    );
  }
}
