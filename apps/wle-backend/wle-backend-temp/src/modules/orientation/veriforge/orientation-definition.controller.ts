import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import * as multer from 'multer';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../../config/routes';
import { COMPANY_ADMIN_ROLES, SUPERVISOR_ROLES } from '../../vera-core/roles';
import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationDefinitionService } from './orientation-definition.service';
import type { OrientationDefinitionType } from './orientation.types';
import {
  assertOrientationUploadFile,
  buildSecureOrientationObjectKey,
  ORIENTATION_UPLOAD_MAX_BYTES,
} from './orientation-validation';

@Controller(`${API_V1_PREFIX}/orientation-definitions`)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrientationDefinitionController {
  constructor(
    private readonly definitions: OrientationDefinitionService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SUPERVISOR_ROLES)
  create(
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      companyId?: number;
      title: string;
      type: OrientationDefinitionType;
      contentMode?: 'uploaded' | 'native' | 'hybrid';
      contentBlocks?: unknown[];
      version?: string;
      isPublished?: boolean;
      expiryRules?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    return this.definitions.create({
      companyId,
      title: body.title,
      type: body.type,
      contentMode: body.contentMode,
      contentBlocks: body.contentBlocks as never,
      createdByUserId: req.user.id,
      version: body.version,
      isPublished: body.isPublished,
      expiryRules: body.expiryRules as never,
      metadata: body.metadata as never,
    });
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  @Throttle(20, 60)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: ORIENTATION_UPLOAD_MAX_BYTES },
    }),
  )
  async upload(
    @Req() req: { user: SecurityActor },
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body()
    body: {
      companyId?: number;
      title?: string;
      type?: OrientationDefinitionType;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    if (!file) {
      throw new BadRequestException('file is required');
    }
    assertOrientationUploadFile(file);

    // Persist via object-storage key convention; CoreUpload can attach later.
    const sourceFileKey = buildSecureOrientationObjectKey({
      companyId,
      originalName: file.originalname,
    });
    return this.definitions.createFromUpload({
      companyId,
      title: body.title ?? file.originalname.replace(/\.[^.]+$/, ''),
      type: body.type ?? 'company',
      createdByUserId: req.user.id,
      sourceFileKey,
      metadata: {
        mimeType: file.mimetype,
        size: file.size,
        originalName: file.originalname,
        storage: 'object',
      },
    });
  }

  @Get()
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER, UserRole.CONTRACTOR_USER)
  list(
    @Req() req: { user: SecurityActor },
    @Query('companyId') companyIdRaw?: string,
    @Query('projectId') projectIdRaw?: string,
    @Query('type') type?: OrientationDefinitionType,
    @Query('isPublished') isPublishedRaw?: string,
  ) {
    const companyId = this.tenant.effectiveCompanyId(
      req.user,
      companyIdRaw ? parseInt(companyIdRaw, 10) : undefined,
    );
    return this.definitions.list({
      companyId,
      projectId: projectIdRaw ? parseInt(projectIdRaw, 10) : undefined,
      type,
      isPublished:
        isPublishedRaw === 'true'
          ? true
          : isPublishedRaw === 'false'
            ? false
            : undefined,
    });
  }

  @Get(':id')
  @Roles(
    ...SUPERVISOR_ROLES,
    UserRole.WORKER,
    UserRole.CONTRACTOR_USER,
  )
  get(
    @Req() req: { user: SecurityActor },
    @Param('id') id: string,
    @Query('companyId') companyIdRaw?: string,
  ) {
    const companyId = this.tenant.effectiveCompanyId(
      req.user,
      companyIdRaw ? parseInt(companyIdRaw, 10) : undefined,
    );
    return this.definitions.get(id, { companyId });
  }

  @Put(':id')
  @Roles(...SUPERVISOR_ROLES)
  update(
    @Param('id') id: string,
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      title?: string;
      type?: OrientationDefinitionType;
      contentMode?: 'uploaded' | 'native' | 'hybrid';
      contentBlocks?: unknown[];
      isPublished?: boolean;
      expiryRules?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
      bumpVersion?: boolean;
    },
  ) {
    return this.definitions.update(
      id,
      {
        title: body.title,
        type: body.type,
        contentMode: body.contentMode,
        contentBlocks: body.contentBlocks as never,
        isPublished: body.isPublished,
        expiryRules: body.expiryRules as never,
        metadata: body.metadata as never,
        bumpVersion: body.bumpVersion,
      },
      { id: req.user.id, companyId: req.user.companyId ?? undefined },
    );
  }
}
