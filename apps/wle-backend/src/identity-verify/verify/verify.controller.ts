import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { VerifyService } from './verify.service';

@Controller('identity-verify')
export class VerifyController {
  constructor(private readonly verifyService: VerifyService) {}

  // ---------------------------------------------------------
  // USER → WORKER → CREDENTIALS + TRAINING + COMPANY
  // ---------------------------------------------------------
  @Get('user/:id')
  async verifyUser(@Param('id', ParseIntPipe) id: number) {
    const result = await this.verifyService.verifyUser(id);
    if (!result) throw new NotFoundException('User not found');

    return {
      ok: true,
      type: 'user',
      ...result,
    };
  }

  // ---------------------------------------------------------
  // USER CREDENTIALS (VALID + EXPIRED)
  // ---------------------------------------------------------
  @Get('user/:id/credentials')
  async verifyUserCredentials(@Param('id', ParseIntPipe) id: number) {
    const result = await this.verifyService.verifyUser(id);

    return {
      ok: true,
      type: 'user-credentials',
      userId: id,
      validCredentials: result.validCredentials,
      expiredCredentials: result.expiredCredentials,
    };
  }

  // ---------------------------------------------------------
  // USER TRAINING RECORDS
  // ---------------------------------------------------------
  @Get('user/:id/training')
  async verifyUserTraining(@Param('id', ParseIntPipe) id: number) {
    const result = await this.verifyService.getUserTraining(id);

    return {
      ok: true,
      type: 'user-training',
      ...result,
    };
  }

  // ---------------------------------------------------------
  // SINGLE CREDENTIAL LOOKUP
  // ---------------------------------------------------------
  @Get('credential/:id')
  async verifyCredential(@Param('id', ParseIntPipe) id: number) {
    const result = await this.verifyService.verifyCredential(id);

    return {
      ok: true,
      type: 'credential',
      ...result,
    };
  }

  // ---------------------------------------------------------
  // CREDENTIAL STATUS ONLY
  // ---------------------------------------------------------
  @Get('credential/:id/status')
  async verifyCredentialStatus(@Param('id', ParseIntPipe) id: number) {
    const result = await this.verifyService.verifyCredential(id);

    return {
      ok: true,
      type: 'credential-status',
      credentialId: id,
      credentialStatus: result.status, // ✔ renamed to avoid collision
      expiresOn: result.expiresOn,
    };
  }

  // ---------------------------------------------------------
  // USER SUMMARY (CREDENTIALS + TRAINING)
  // ---------------------------------------------------------
  @Get('user/:id/summary')
  async verifyUserSummary(@Param('id', ParseIntPipe) id: number) {
    const result = await this.verifyService.verifyUser(id);

    return {
      ok: true,
      type: 'user-summary',
      userId: id,
      validCredentials: result.validCredentials,
      expiredCredentials: result.expiredCredentials,
      trainingRecords: result.trainingRecords,
    };
  }
}
