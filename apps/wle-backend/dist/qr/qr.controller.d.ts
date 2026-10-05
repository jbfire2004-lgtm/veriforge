import { QrScanDto } from './dto/qr-scan.dto';
import { QrService } from './qr.service';
export declare class QrController {
    private readonly qrService;
    constructor(qrService: QrService);
    scan(body: QrScanDto): Promise<unknown>;
    workerQr(id: number): Promise<{
        type: string;
        workerId: number;
        qrToken: string;
        content: string;
        verifyUrl: string;
        json: {
            type: string;
            token: string;
            id: number;
        };
    }>;
    equipmentQr(id: number): Promise<{
        type: string;
        equipmentId: number;
        qrToken: string;
        content: string;
        verifyUrl: string;
        json: {
            type: string;
            token: string;
            id: number;
        };
    }>;
    combinedQr(workerId: number, equipmentId: number): {
        type: string;
        workerId: number;
        equipmentId: number;
        content: string;
        legacy: boolean;
    };
}
