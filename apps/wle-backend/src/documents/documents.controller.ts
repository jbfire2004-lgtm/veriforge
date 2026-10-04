import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import * as multer from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MulterExceptionFilter } from '../modules/core-upload/filters/multer-exception.filter';
import { WorkersService } from '../workers/workers.service';
import { DocumentsService } from './documents.service';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

const DOCUMENT_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;

const DOCUMENT_ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

type AuthedRequest = { user?: { id: number; role: string } };

const ELEVATED = [
  UserRole.ADMIN,
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
] as const;

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ELEVATED)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly docs: DocumentsService,
    private readonly workersService: WorkersService,
  ) {}

  // ---------------------------------------------------------
  // MULTIPART FILE UPLOAD → disk → Document row (public URL /uploads/...)
  // ---------------------------------------------------------
  @Post('upload')
  @UseFilters(MulterExceptionFilter)
  @UsePipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: false,
    }),
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          ensureUploadDir();
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const safe = `${Date.now()}-${randomBytes(8).toString(
            'hex',
          )}${extname(file.originalname)}`;
          cb(null, safe);
        },
      }),
      limits: { fileSize: DOCUMENT_UPLOAD_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const mime = (file.mimetype || '').trim();
        if (mime && DOCUMENT_ALLOWED_MIMES.has(mime)) {
          return cb(null, true);
        }
        const name = (file.originalname || '').toLowerCase();
        if (
          name.endsWith('.pdf') &&
          DOCUMENT_ALLOWED_MIMES.has('application/pdf')
        ) {
          return cb(null, true);
        }
        if (name.endsWith('.png') && DOCUMENT_ALLOWED_MIMES.has('image/png')) {
          return cb(null, true);
        }
        if (
          (name.endsWith('.jpg') || name.endsWith('.jpeg')) &&
          DOCUMENT_ALLOWED_MIMES.has('image/jpeg')
        ) {
          return cb(null, true);
        }
        if (
          name.endsWith('.webp') &&
          DOCUMENT_ALLOWED_MIMES.has('image/webp')
        ) {
          return cb(null, true);
        }
        if (name.endsWith('.gif') && DOCUMENT_ALLOWED_MIMES.has('image/gif')) {
          return cb(null, true);
        }
        return cb(
          new BadRequestException(
            `Unsupported file type ${mime || '(empty)'}. Allowed: ${[
              ...DOCUMENT_ALLOWED_MIMES,
            ].join(', ')}`,
          ),
          false,
        );
      },
    }),
  )
  uploadMultipart(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, string>,
  ) {
    if (!file) throw new BadRequestException('file is required');

    const type = body.type?.trim() || 'TRAINING';
    const name = body.name?.trim() || file.originalname;
    const description = body.description?.trim();
    const tags = body.tags
      ? body.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const workerId = body.workerId ? parseInt(body.workerId, 10) : undefined;
    const equipmentId = body.equipmentId
      ? parseInt(body.equipmentId, 10)
      : undefined;
    const companyId = body.companyId ? parseInt(body.companyId, 10) : undefined;

    const base =
      process.env.PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';
    const url = `${base}/uploads/${file.filename}`;

    return this.docs.upload({
      type,
      name,
      url,
      description,
      tags,
      workerId: Number.isFinite(workerId) ? workerId : undefined,
      equipmentId: Number.isFinite(equipmentId) ? equipmentId : undefined,
      companyId: Number.isFinite(companyId) ? companyId : undefined,
    });
  }

  // ---------------------------------------------------------
  // UPLOAD DOCUMENT (JSON metadata + existing URL)
  // ---------------------------------------------------------
  @Post()
  upload(
    @Body()
    body: {
      type: string;
      name: string;
      url: string;
      description?: string;
      tags?: string[];
      workerId?: number;
      equipmentId?: number;
      companyId?: number;
    },
  ) {
    return this.docs.upload(body);
  }

  // ---------------------------------------------------------
  // LIST ALL DOCUMENTS
  // ---------------------------------------------------------
  @Get()
  findAll() {
    return this.docs.findAll();
  }

  // ---------------------------------------------------------
  // SEARCH DOCUMENTS (static segment before `:id`)
  // ---------------------------------------------------------
  @Get('search/:query')
  search(@Param('query') query: string) {
    return this.docs.search(query);
  }

  // ---------------------------------------------------------
  // LIST BY WORKER (workers: own list only)
  // ---------------------------------------------------------
  @Get('worker/:id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  async forWorker(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.assertWorkerSelfOrElevated(req, id);
    return this.docs.forWorker(id);
  }

  // ---------------------------------------------------------
  // LIST BY EQUIPMENT
  // ---------------------------------------------------------
  @Get('equipment/:id')
  forEquipment(@Param('id', ParseIntPipe) id: number) {
    return this.docs.forEquipment(id);
  }

  // ---------------------------------------------------------
  // LIST BY COMPANY
  // ---------------------------------------------------------
  @Get('company/:id')
  forCompany(@Param('id', ParseIntPipe) id: number) {
    return this.docs.forCompany(id);
  }

  // ---------------------------------------------------------
  // UNASSIGNED DOCUMENT QUEUE (Phase 1)
  // ---------------------------------------------------------
  @Get('unassigned/company/:companyId')
  getUnassigned(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.docs.getUnassigned(companyId);
  }

  // ---------------------------------------------------------
  // GET DOCUMENT BY ID (workers: assigned doc only)
  // ---------------------------------------------------------
  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  async findOne(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const doc = await this.docs.findOne(id);
    await this.assertDocumentReadableByWorker(req, doc);
    return doc;
  }

  // ---------------------------------------------------------
  // ASSIGN DOCUMENT TO WORKER (Phase 1)
  // ---------------------------------------------------------
  @Patch(':id/assign/:workerId')
  assignToWorker(
    @Param('id', ParseIntPipe) id: number,
    @Param('workerId', ParseIntPipe) workerId: number,
  ) {
    return this.docs.assignToWorker(id, workerId);
  }

  // ---------------------------------------------------------
  // ASSIGN DOCUMENT TO EQUIPMENT (optional)
  // ---------------------------------------------------------
  @Patch(':id/assign-equipment/:equipmentId')
  assignToEquipment(
    @Param('id', ParseIntPipe) id: number,
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
  ) {
    return this.docs.assignToEquipment(id, equipmentId);
  }

  // ---------------------------------------------------------
  // UPDATE DOCUMENT
  // ---------------------------------------------------------
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{ name: string; description: string; tags: string[] }>,
  ) {
    return this.docs.update(id, body);
  }

  // ---------------------------------------------------------
  // SOFT DELETE
  // ---------------------------------------------------------
  @Patch(':id/delete')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.docs.softDelete(id);
  }

  // ---------------------------------------------------------
  // RESTORE
  // ---------------------------------------------------------
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.docs.restore(id);
  }

  private async assertWorkerSelfOrElevated(
    req: AuthedRequest,
    workerId: number,
  ) {
    const u = req.user;
    if (!u) throw new ForbiddenException();
    if (
      u.role === UserRole.ADMIN ||
      u.role === UserRole.SUPERVISOR ||
      u.role === UserRole.PROJECT_MANAGER
    ) {
      return;
    }
    if (u.role !== UserRole.WORKER) {
      throw new ForbiddenException('Insufficient permissions');
    }
    const own = await this.workersService.findWorkerIdByUserId(u.id);
    if (own !== workerId) {
      throw new ForbiddenException(
        'Workers may only access their own documents',
      );
    }
  }

  private async assertDocumentReadableByWorker(
    req: AuthedRequest,
    doc: { workerId: number | null },
  ) {
    const u = req.user;
    if (!u) throw new ForbiddenException();
    if (
      u.role === UserRole.ADMIN ||
      u.role === UserRole.SUPERVISOR ||
      u.role === UserRole.PROJECT_MANAGER
    ) {
      return;
    }
    if (u.role !== UserRole.WORKER) {
      throw new ForbiddenException('Insufficient permissions');
    }
    const own = await this.workersService.findWorkerIdByUserId(u.id);
    if (doc.workerId != null && doc.workerId === own) {
      return;
    }
    throw new ForbiddenException(
      'Workers may only access documents assigned to them',
    );
  }
}
