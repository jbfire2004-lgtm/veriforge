export declare function publicBaseUrl(): string;
export declare function workerVerifyUrlByToken(qrToken: string, base?: string): string;
export declare function workerVerifyUrl(workerId: number, base?: string): string;
export declare function workerStaffWalletPath(workerId: number): string;
export declare function equipmentVerifyUrlByToken(qrToken: string, base?: string): string;
export declare function equipmentVerifyUrl(equipmentId: number, base?: string): string;
export declare function equipmentStaffWalletPath(equipmentId: number): string;
export declare function workerQrJsonPayload(qrToken: string, workerId: number): {
    type: string;
    token: string;
    id: number;
};
export declare function equipmentQrJsonPayload(qrToken: string, equipmentId: number): {
    type: string;
    token: string;
    id: number;
};
export declare function workerScanAliasUrl(workerId: number, base?: string): string;
export declare function equipmentScanAliasUrl(equipmentId: number, base?: string): string;
