import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

import { Roles } from '../../auth/roles.decorator';

import { RolesGuard } from '../../auth/roles.guard';

import { AuditLogService } from '../../audit/audit-log.service';

import { API_V1_PREFIX } from '../../config/routes';

import { rolesFor } from '../../security/rbac';

import { CredentialLedgerChainService } from './credential-ledger-chain.service';

import { CredentialLedgerBackfillService } from './credential-ledger-backfill.service';

import { CredentialLedgerBackfillDto } from './dto/credential-ledger-backfill.dto';

type AuthReq = Request & { user?: { id: number; companyId?: number | null } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...rolesFor('viewCredentialChain'))
@Controller(`${API_V1_PREFIX}/credential-ledger`)
export class CredentialLedgerController {
  constructor(
    private readonly chain: CredentialLedgerChainService,

    private readonly backfill: CredentialLedgerBackfillService,

    private readonly audit: AuditLogService,
  ) {}

  @Post('backfill')
  @Roles(...rolesFor('credentialLedgerBackfill'))
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async runBackfill(
    @Body() body: CredentialLedgerBackfillDto,

    @Req() req: AuthReq,
  ) {
    const result = await this.backfill.backfill(body);

    await this.audit.logAudit(
      req.user
        ? { id: req.user.id, companyId: req.user.companyId ?? undefined }
        : null,

      'credential_ledger.backfill',

      { type: 'CredentialLedger', id: 'backfill' },

      {
        companyId: body.companyId ?? null,

        dryRun: body.dryRun ?? false,

        limit: body.limit ?? null,

        processed: (result as { processed?: number }).processed ?? null,
      },
    );

    return result;
  }

  @Get(':credentialId/verification-chain')
  verificationChain(@Param('credentialId', ParseIntPipe) credentialId: number) {
    return this.chain.resolveVerificationChain(credentialId);
  }
}
