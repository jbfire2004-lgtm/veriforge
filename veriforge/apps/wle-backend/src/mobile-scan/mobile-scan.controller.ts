import { Controller, Post, Body } from '@nestjs/common';
import { MobileScanService } from './mobile-scan.service';

@Controller('mobile-scan')
export class MobileScanController {
  constructor(private readonly mobile: MobileScanService) {}

  @Post()
  scan(@Body() body: { qr: string }) {
    return this.mobile.scan(body.qr);
  }
}
