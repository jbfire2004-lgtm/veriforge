export declare function finitePositiveInt(v: unknown): number | null;
export declare function parseWorkerPathId(qr: string): number | null;
export declare function parseTypedJsonQr(qr: string): {
    kind: 'worker' | 'equipment';
    id: number;
    token?: string;
} | null;
export declare function parseCertificateToken(qr: string): string | null;
export declare function parseEquipmentPathId(qr: string): number | null;
export declare function parseCombinedUrlIds(qr: string): {
    workerId: number;
    equipmentId: number;
} | null;
