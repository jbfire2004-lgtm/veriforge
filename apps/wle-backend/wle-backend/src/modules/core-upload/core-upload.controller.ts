import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { CoreUploadService } from './core-upload.service';
import { getCoreUploadConfig } from './core-upload.config';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { MultipartFieldsDto } from './dto/multipart-fields.dto';
import { PresignDto } from './dto/presign.dto';
import { MulterExceptionFilter } from './filters/multer-exception.filter';

type UploadActor = {
  id: number;
  companyId?: number | null;
};

const memoryUpload = () =>
  FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: getCoreUploadConfig().maxBytes },
    fileFilter: (_req, file, cb) => {
      const { allowedMimeTypes } = getCoreUploadConfig();
      if (!allowedMimeTypes.has(file.mimetype)) {
        return cb(
          new BadRequestException(
            `File type not allowed: ${file.mimetype || '(empty)'}. Allowed: ${[
              ...allowedMimeTypes,
            ].join(', ')}`,
          ),
          false,
        );
      }
      cb(null, true);
    },
  });

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.ADMIN,
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
  UserRole.WORKER,
  UserRole.COMPANY_ADMIN,
  UserRole.SUPER_ADMIN,
)
@Controller(`${API_V1_PREFIX}/core/uploads`)
@UseFilters(MulterExceptionFilter)
export class CoreUploadController {
  constructor(private readonly coreUpload: CoreUploadService) {}

  private ownershipFrom(
    req: { user?: UploadActor },
    companyIdOverride?: number,
    projectId?: number,
  ) {
    return {
      userId: req.user?.id ?? null,
      companyId: companyIdOverride ?? req.user?.companyId ?? null,
      projectId: projectId ?? null,
    };
  }

  @Get('config')
  config() {
    return this.coreUpload.getPublicConfig();
  }

  @Get('purposes')
  purposes() {
    return this.coreUpload.listPurposes();
  }

  @Post('presign')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  presign(@Body() dto: PresignDto, @Req() req: { user?: UploadActor }) {
    return this.coreUpload.createPresignedUpload(
      dto,
      this.ownershipFrom(req, dto.companyId, dto.projectId),
    );
  }

  @Post('complete')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  complete(@Body() dto: CompleteUploadDto) {
    return this.coreUpload.completeDirectUpload(dto.id);
  }

  @Post('abandon/:id')
  abandon(@Param('id', ParseIntPipe) id: number) {
    return this.coreUpload.abandonDirectUpload(id);
  }

  @Post()
  @UseInterceptors(memoryUpload())
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: MultipartFieldsDto,
    @Req() req: { user?: UploadActor },
  ) {
    if (!file) throw new BadRequestException('file is required');
    return this.coreUpload.handleMultipartUpload(
      file,
      body.purpose,
      this.ownershipFrom(req, body.companyId, body.projectId),
    );
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.coreUpload.findOne(id);
  }
}
