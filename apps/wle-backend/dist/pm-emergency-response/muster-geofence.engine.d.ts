export type GeoPoint = {
    lat: number;
    lng: number;
};
export type MusterPoint = {
    code: string;
    label: string;
    lat: number;
    lng: number;
    radiusMeters?: number;
};
export declare class MusterGeofenceEngine {
    distanceMeters(a: GeoPoint, b: GeoPoint): number;
    nearestMusterPoint(workerLocation: GeoPoint, points: MusterPoint[]): {
        point: MusterPoint;
        distanceMeters: number;
    } | null;
    isInsideMusterGeofence(workerLocation: GeoPoint, point: MusterPoint): boolean;
}
