import { QrService } from '../../../qr/qr.service';
export declare class QrApiService {
    private readonly qr;
    constructor(qr: QrService);
    scan(body: {
        qr: string;
        assumedTarget?: string;
    }): Promise<unknown>;
}
