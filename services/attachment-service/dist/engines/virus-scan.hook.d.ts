import type { VirusScanResult } from '../types';
export declare function runVirusScanHook(input: {
    attachmentId: string;
    companyId: string;
    filePath: string;
    fileType: string;
    fileSize: number;
}): Promise<VirusScanResult>;
