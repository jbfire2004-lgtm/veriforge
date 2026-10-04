import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { PublicRateLimited } from '../security/decorators/public-rate-limit.decorator';
import { PositiveIntPipe } from '../security/validation/positive-int.pipe';
import { QrScanDto } from './dto/qr-scan.dto';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @PublicRateLimited(40)
  @Post('scan')
  scan(@Body() body: QrScanDto) {
    return this.qrService.parseAndVerify(body);
  }

  @PublicRateLimited(30)
  @Get('worker/:id')
  workerQr(@Param('id', PositiveIntPipe) id: number) {
    return this.qrService.generateWorkerQr(id);
  }

  @PublicRateLimited(30)
  @Get('equipment/:id')
  equipmentQr(@Param('id', PositiveIntPipe) id: number) {
    return this.qrService.generateEquipmentQr(id);
  }

  @PublicRateLimited(30)
  @Get('combined')
  combinedQr(
    @Query('worker', PositiveIntPipe) workerId: number,
    @Query('equipment', PositiveIntPipe) equipmentId: number,
  ) {
    return this.qrService.generateCombinedQr(workerId, equipmentId);
  }
}
