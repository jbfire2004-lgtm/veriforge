import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { Permission } from '../security/security.types';
import { DocumentIntelligenceAiService } from './document-intelligence-ai.service';
import type { DocumentIntelligenceAiInput } from './document-intelligence-ai.types';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Document Intelligence Engine — classify, extract, validate, and link uploaded evidence. */
@Controller('api/ai/document')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class DocumentIntelligenceAiController {
  constructor(
    private readonly documentIntelligence: DocumentIntelligenceAiService,
  ) {}

  @Post('intelligence')
  @HttpCode(200)
  analyze(@Body() body: DocumentIntelligenceAiInput) {
    return this.documentIntelligence.analyze(body);
  }

  @Post('intelligence/document/:documentId')
  @HttpCode(200)
  analyzeDocument(@Param('documentId', ParseIntPipe) documentId: number) {
    return this.documentIntelligence.analyze({ documentId });
  }

  @Post('intelligence/upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  analyzeUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      companyId?: string;
      projectId?: string;
      workerId?: string;
      hints?: string;
    },
  ) {
    return this.documentIntelligence.analyzeUpload(file, body);
  }
}
