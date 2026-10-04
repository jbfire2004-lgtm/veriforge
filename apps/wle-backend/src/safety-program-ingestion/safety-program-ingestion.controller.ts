import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  SafetyProgramIngestChannel,
  SafetyProgramIngestStatus,
  UserRole,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { SafetyProgramIngestionService } from './safety-program-ingestion.service';

const ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.CONTRACTOR_ADMIN,
  UserRole.CONTRACTOR_USER,
];

class ExtractTextDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsIn(['core', 'pm', 'api'])
  channel?: SafetyProgramIngestChannel;

  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsString()
  sourceReference?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  coreFileId?: number;

  @IsOptional()
  @IsBoolean()
  usePipeline?: boolean;
}

class UploadDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsIn(['core', 'pm', 'api'])
  channel?: SafetyProgramIngestChannel;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  coreFileId?: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  sourceReference?: string;
}

class CorrectDto {
  @IsObject()
  extractJson!: Record<string, unknown>;
}

class ConfirmDto {
  @IsString()
  @MinLength(1)
  confirmedBy!: string;
}

class RejectDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

class MergeDto {
  @IsArray()
  chunks!: Record<string, unknown>[];
}

class NormalizeDto {
  @IsOptional()
  @IsObject()
  document?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  documents?: Record<string, unknown>[];
}

class SummarizeDto {
  @IsOptional()
  @IsObject()
  document?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  runId?: string;
}

class SitePlanDto {
  @IsOptional()
  @IsArray()
  documents?: Record<string, unknown>[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  runIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsString()
  worksiteDescription!: string;

  @IsString()
  plannedActivities!: string;
}

type AuthReq = {
  user?: { id?: number; name?: string; sub?: string };
};

@Controller(`${API_V1_PREFIX}/safety-program-ingestion`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ROLES)
export class SafetyProgramIngestionController {
  constructor(private readonly ingestion: SafetyProgramIngestionService) {}

  @Post('extract-text')
  extractText(@Body() body: ExtractTextDto) {
    return this.ingestion.extractText(body);
  }

  @Post('upload')
  upload(@Body() body: UploadDto) {
    return this.ingestion.upload(body);
  }

  @Post('merge')
  merge(@Body() body: MergeDto) {
    return this.ingestion.mergeChunks(body.chunks ?? []);
  }

  @Post('normalize')
  normalize(@Body() body: NormalizeDto) {
    if (body.documents?.length) {
      return this.ingestion.normalizeDocuments(body.documents);
    }
    if (body.document) {
      return this.ingestion.normalizeDocument(body.document);
    }
    return this.ingestion.normalizeDocuments([]);
  }

  @Post('summarize')
  async summarize(@Body() body: SummarizeDto) {
    if (body.runId) return this.ingestion.summarizeRun(body.runId);
    if (body.document) return this.ingestion.summarize(body.document);
    return {
      document_summary: '',
      hazard_summaries: [],
      control_summaries: [],
    };
  }

  @Post('site-plan')
  async sitePlan(@Body() body: SitePlanDto) {
    const markdown = await this.ingestion.buildSitePlan(body);
    return { markdown };
  }

  @Get('runs')
  list(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: SafetyProgramIngestStatus,
  ) {
    return this.ingestion.list({
      companyId: Number(companyId),
      projectId: projectId ? Number(projectId) : undefined,
      status,
    });
  }

  @Get('runs/:id')
  get(@Param('id') id: string) {
    return this.ingestion.get(id);
  }

  @Patch('runs/:id/correct')
  correct(@Param('id') id: string, @Body() body: CorrectDto) {
    return this.ingestion.correct(id, body.extractJson);
  }

  @Post('runs/:id/confirm')
  confirm(
    @Param('id') id: string,
    @Body() body: ConfirmDto,
    @Req() req: AuthReq,
  ) {
    return this.ingestion.confirm(
      id,
      body.confirmedBy,
      typeof req.user?.id === 'number' ? req.user.id : undefined,
    );
  }

  @Post('runs/:id/reject')
  reject(@Param('id') id: string, @Body() body: RejectDto) {
    return this.ingestion.reject(id, body.reason);
  }
}
