"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusterGeofenceEngine = void 0;
class MusterGeofenceEngine {
    distanceMeters(a, b) {
        const R = 6371000;
        const dLat = ((b.lat - a.lat) * Math.PI) / 180;
        const dLng = ((b.lng - a.lng) * Math.PI) / 180;
        const lat1 = (a.lat * Math.PI) / 180;
        const lat2 = (b.lat * Math.PI) / 180;
        const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(h));
    }
    nearestMusterPoint(workerLocation, points) {
        if (!points.length)
            return null;
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
    isInsideMusterGeofence(workerLocation, point) {
        var _a;
        const radius = (_a = point.radiusMeters) !== null && _a !== void 0 ? _a : 75;
        return (this.distanceMeters(workerLocation, {
            lat: point.lat,
            lng: point.lng,
        }) <= radius);
    }
}
exports.MusterGeofenceEngine = MusterGeofenceEngine;
//# sourceMappingURL=muster-geofence.engine.js.map