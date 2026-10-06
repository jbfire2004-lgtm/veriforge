import { Injectable } from '@nestjs/common';
import { QrService } from '../../../qr/qr.service';

@Injectable()
export class QrApiService {
  constructor(private readonly qr: QrService) {}

  scan(body: { qr: string; assumedTarget?: string }) {
    return this.qr.parseAndVerify({
      qr: body.qr,
      assumedTarget: body.assumedTarget,
    } as never);
  }
}
