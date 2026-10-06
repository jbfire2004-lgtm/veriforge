import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../../config/routes';
import { SUPERVISOR_ROLES } from '../../vera-core/roles';
import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationAiGenerateService } from './orientation-ai-generate.service';
import type { OrientationContentBlock } from './orientation.types';

@Controller(`${API_V1_PREFIX}/ai/orientation`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...SUPERVISOR_ROLES)
export class OrientationAiController {
  constructor(
    private readonly ai: OrientationAiGenerateService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Post('generate-from-text')
  @HttpCode(HttpStatus.OK)
  @Throttle(10, 60)
  generateFromText(
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      companyId?: number;
      title?: string;
      text: string;
      type?: string;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    return this.ai.generateFromText({
      companyId,
      title: body.title,
      text: body.text,
      type: body.type,
    });
  }

  @Post('generate-from-file')
  @HttpCode(HttpStatus.OK)
  @Throttle(10, 60)
  generateFromFile(
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      companyId?: number;
      title?: string;
      fileName: string;
      mimeType?: string;
      textExtract?: string;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    return this.ai.generateFromFile({
      companyId,
      title: body.title,
      fileName: body.fileName,
      mimeType: body.mimeType,
      textExtract: body.textExtract,
    });
  }

  @Post('generate-quiz')
  @HttpCode(HttpStatus.OK)
  @Throttle(10, 60)
  generateQuiz(
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      companyId?: number;
      topic: string;
      contentBlocks?: OrientationContentBlock[];
      questionCount?: number;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    return this.ai.generateQuiz({
      companyId,
      topic: body.topic,
      contentBlocks: body.contentBlocks,
      questionCount: body.questionCount,
    });
  }

  @Post('improve-block')
  @HttpCode(HttpStatus.OK)
  @Throttle(20, 60)
  improveBlock(
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      companyId?: number;
      block: OrientationContentBlock;
      instruction?: string;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    return this.ai.improveBlock({
      companyId,
      block: body.block,
      instruction: body.instruction,
    });
  }
}
