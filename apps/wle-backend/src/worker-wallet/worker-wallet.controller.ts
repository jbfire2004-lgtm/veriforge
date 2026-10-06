import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { API_V1_PREFIX } from '../config/routes';
import { WorkerWalletService } from './worker-wallet.service';

type AuthReq = { user: { id: number } };

@Controller(`${API_V1_PREFIX}/worker-wallet`)
export class WorkerWalletController {
  constructor(private readonly wallet: WorkerWalletService) {}

  @Get('download')
  getDownloadInfo() {
    return this.wallet.getDownloadInfo();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myWallet(@Req() req: AuthReq) {
    const workerId = await this.wallet.resolveWorkerIdForUser(req.user.id);
    if (!workerId) {
      return { workerId: null, download: this.wallet.getDownloadInfo() };
    }
    return {
      workerId,
      download: this.wallet.getDownloadInfo(),
      qr: await this.wallet.generateWorkerQr(workerId, req.user.id),
      profile: await this.wallet.syncWorkerProfile(workerId, req.user.id),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('qr/:workerId')
  generateQr(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Req() req: AuthReq,
  ) {
    return this.wallet.generateWorkerQr(workerId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync/:workerId')
  syncProfile(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Req() req: AuthReq,
  ) {
    return this.wallet.syncWorkerProfile(workerId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bundle/:workerId')
  offlineBundle(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Req() req: AuthReq,
  ) {
    return this.wallet.getOfflineBundle(workerId, req.user.id);
  }

  @Get('blockchain/validate/:tokenId')
  validateBlockchain(
    @Param('tokenId') tokenId: string,
    @Query('trainingRecordId') trainingRecordId?: string,
  ) {
    return this.wallet.validateBlockchainCredential(
      decodeURIComponent(tokenId),
      trainingRecordId ? Number(trainingRecordId) : undefined,
    );
  }
}
