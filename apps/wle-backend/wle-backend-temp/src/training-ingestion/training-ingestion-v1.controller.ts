import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Public } from '../auth/public.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { TrainingIngestUploadFieldsDto } from './dto/training-ingest-upload-fields.dto';
import { EmailIngestDto } from './dto/email-ingest.dto';
import { BulkVerifyDto } from './dto/bulk-verify.dto';
import { TrainingIngestionService } from './training-ingestion.service';
import { TrainingQrIngestionService } from './training-qr-ingestion.service';
import { TrainingProviderIngestionService } from './training-provider-ingestion.service';
import { TrainingStandardsComplianceService } from '../modules/training-standards-compliance/training-standards-compliance.service';
import {
  QrIngestBodySchema,
  ReviewCorrectBodySchema,
  ConfirmIngestBodySchema,
} from './pipeline/schemas';
import type { Request } from 'express';

type ReqUser = Request & { user: { id: number } };
import {
  TRAINING_INGEST_ALLOWED_MIMES,
  TRAINING_INGEST_UPLOAD_MAX_BYTES,
} from './training-ingestion-upload.config';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
)
@Controller(`${API_V1_PREFIX}/training-ingestion`)
export class TrainingIngestionV1Controller {
  constructor(
    private readonly ingestion: TrainingIngestionService,
    private readonly qrIngestion: TrainingQrIngestionService,
    private readonly providerIngestion: TrainingProviderIngestionService,
    private readonly standards: TrainingStandardsComplianceService,
  ) {}

  @Get('needs-review')
  needsReviewQueue(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('limit') limit?: string,
  ) {
    return this.ingestion.needsReviewQueue(
      companyId,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('runs')
  listRuns(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('status') status?: string,
    @Query('sourceChannel') sourceChannel?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ingestion.listRuns({
      companyId,
      status,
      sourceChannel,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('verification-queue')
  verificationQueue(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('limit') limit?: string,
  ) {
    return this.ingestion.verificationQueue(
      companyId,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('runs/:id')
  getRun(@Param('id', ParseIntPipe) id: number) {
    return this.ingestion.getRun(id);
  }

  @Public()
  @Throttle(30, 60)
  @Post('email')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  emailIngest(
    @Body() body: EmailIngestDto,
    @Headers('x-training-email-secret') secret?: string,
  ) {
    return this.ingestion.processEmailIngest(body, secret);
  }

  @Throttle(20, 60)
  @Post('preview')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: TRAINING_INGEST_UPLOAD_MAX_BYTES },
    }),
  )
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  preview(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: TrainingIngestUploadFieldsDto,
  ) {
    if (!file) throw new BadRequestException('file is required');
    return this.ingestion.previewFileUpload(
      body.companyId,
      file,
      body.metadata,
    );
  }

  @Post('confirm')
  confirm(@Body() body: unknown) {
    const parsed = ConfirmIngestBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    return this.ingestion.confirmIngest(parsed.data.companyId, parsed.data);
  }

  @Post('qr')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  qrIngest(@Body() body: unknown) {
    const parsed = QrIngestBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    return this.qrIngestion.ingestFromQr(
      parsed.data.companyId,
      parsed.data.workerId,
      parsed.data.qr,
    );
  }

  @Public()
  @Throttle(60, 60)
  @Post('provider/:providerId')
  providerIngest(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() body: unknown,
    @Headers('x-vera-signature') signature?: string,
    @Req() req?: Request,
  ) {
    const rawBody =
      (req as Request & { rawBody?: Buffer })?.rawBody?.toString('utf8') ??
      JSON.stringify(body);
    return this.providerIngestion.ingestFromProvider(providerId, body, {
      signature,
      rawBody,
    });
  }

  @Post('review/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.COMPANY_ADMIN)
  approveReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { notes?: string },
    @Req() req: ReqUser,
  ) {
    return this.ingestion.approveReview(id, req.user.id, body.notes);
  }

  @Patch('review/:id/correct')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.COMPANY_ADMIN)
  correctReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
    @Req() req: ReqUser,
  ) {
    const parsed = ReviewCorrectBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    return this.ingestion.correctReview(id, req.user.id, parsed.data);
  }

  @Throttle(20, 60)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: TRAINING_INGEST_UPLOAD_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const mime = (file.mimetype || '').trim();
        if (mime && TRAINING_INGEST_ALLOWED_MIMES.has(mime)) {
          return cb(null, true);
        }
        const name = (file.originalname || '').toLowerCase();
        if (name.endsWith('.json')) {
          return cb(null, true);
        }
        if (
          (name.endsWith('.jpg') || name.endsWith('.jpeg')) &&
          TRAINING_INGEST_ALLOWED_MIMES.has('image/jpeg')
        ) {
          return cb(null, true);
        }
        if (
          name.endsWith('.png') &&
          TRAINING_INGEST_ALLOWED_MIMES.has('image/png')
        ) {
          return cb(null, true);
        }
        if (
          name.endsWith('.pdf') &&
          TRAINING_INGEST_ALLOWED_MIMES.has('application/pdf')
        ) {
          return cb(null, true);
        }
        if (
          name.endsWith('.webp') &&
          TRAINING_INGEST_ALLOWED_MIMES.has('image/webp')
        ) {
          return cb(null, true);
        }
        return cb(
          new BadRequestException(
            `Unsupported type ${mime || '(empty)'}. Allowed: ${[
              ...TRAINING_INGEST_ALLOWED_MIMES,
            ].join(', ')}`,
          ),
          false,
        );
      },
    }),
  )
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: TrainingIngestUploadFieldsDto,
  ) {
    if (!file) throw new BadRequestException('file is required');
    return this.ingestion.processFileUpload(
      body.companyId,
      file,
      body.metadata,
      'upload',
    );
  }

  @Throttle(5, 60)
  @Post('bulk-upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: multer.memoryStorage(),
      limits: { fileSize: TRAINING_INGEST_UPLOAD_MAX_BYTES },
    }),
  )
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async bulkUpload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: TrainingIngestUploadFieldsDto,
  ) {
    if (!files?.length) throw new BadRequestException('files are required');
    const results = [];
    for (const file of files) {
      results.push(
        await this.ingestion.processFileUpload(
          body.companyId,
          file,
          body.metadata,
          'bulk',
        ),
      );
    }
    return { count: results.length, runs: results };
  }

  @Post('bulk-verify')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async bulkVerify(@Body() body: BulkVerifyDto, @Req() req: ReqUser) {
    const outcomes = [];
    for (const id of body.validationResultIds) {
      outcomes.push(
        await this.standards.approveValidation(id, req.user.id, body.notes),
      );
    }
    return { approved: outcomes.length, results: outcomes };
  }
}
