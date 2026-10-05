import { QrApiService } from '../services/qr-api.service';
export declare class QrApiController {
    private readonly qr;
    constructor(qr: QrApiService);
    scan(body: {
        qr: string;
        assumedTarget?: string;
    }): Promise<unknown>;
}
