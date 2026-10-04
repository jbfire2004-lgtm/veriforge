import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { rolesFor } from '../security/rbac';
import { ProviderService } from './provider.service';

type UploadProgramBody = {
  providerName: string;
  programName: string;
  description?: string;
  content: string;
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...rolesFor('manageProviderApis'))
@Controller('training-provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post('upload')
  uploadProgram(@Body() body: UploadProgramBody) {
    return this.providerService.uploadProgram(body);
  }

  @Get(':providerName/programs')
  listPrograms(@Param('providerName') providerName: string) {
    return this.providerService.listPrograms(providerName);
  }

  @Get('program/:id')
  getProgram(@Param('id', ParseIntPipe) id: number) {
    return this.providerService.getProgram(id);
  }

  @Post('assess')
  assessProgram(@Body() body: { content: string }) {
    return this.providerService.assessProgram(body.content);
  }

  @Post('program/:id/gap-report')
  gapReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string },
  ) {
    return this.providerService.generateGapReport(id, body.content);
  }
}
