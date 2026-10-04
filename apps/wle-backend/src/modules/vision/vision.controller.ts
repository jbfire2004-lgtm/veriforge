import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { VisionService } from './vision.service';
import type { AnalyzeDocumentDto } from './vision.types';

@Controller(`${API_V1_PREFIX}/vision`)
export class VisionController {
  constructor(private readonly vision: VisionService) {}

  @Post('analyze')
  analyze(@Body() body: AnalyzeDocumentDto) {
    return this.vision.analyze(body);
  }

  @Post('certificate')
  certificate(@Body() body: Omit<AnalyzeDocumentDto, 'documentType'>) {
    return this.vision.analyzeCertificate(body);
  }

  @Post('inspection')
  inspection(@Body() body: Omit<AnalyzeDocumentDto, 'documentType'>) {
    return this.vision.analyzeInspection(body);
  }

  @Post('equipment-plate')
  equipmentPlate(@Body() body: Omit<AnalyzeDocumentDto, 'documentType'>) {
    return this.vision.analyzeEquipmentPlate(body);
  }

  @Post('worker-document')
  workerDocument(
    @Body()
    body: Omit<AnalyzeDocumentDto, 'documentType'> & { subtype?: string },
  ) {
    const subtype = body.subtype as
      | 'worker_id'
      | 'union_card'
      | 'operator_card'
      | undefined;
    return this.vision.analyze({
      ...body,
      documentType: subtype ?? 'worker_id',
    });
  }

  @Post('provider-document')
  providerDocument(
    @Body()
    body: Omit<AnalyzeDocumentDto, 'documentType'> & { subtype?: string },
  ) {
    const subtype = body.subtype as
      | 'provider_approval'
      | 'instructor_qualification'
      | undefined;
    return this.vision.analyze({
      ...body,
      documentType: subtype ?? 'provider_approval',
    });
  }

  @Post('project-form')
  projectForm(@Body() body: Omit<AnalyzeDocumentDto, 'documentType'>) {
    return this.vision.analyze({
      ...body,
      documentType: 'project_safety_form',
    });
  }

  @Get('dashboard')
  dashboard(@Query('companyId') companyId?: string) {
    return this.vision.getDashboard(companyId ? Number(companyId) : undefined);
  }

  @Get('capabilities')
  capabilities(@Query('hasOcrText') hasOcrText?: string) {
    return this.vision.getCapabilities(
      hasOcrText === 'true' || hasOcrText === '1',
    );
  }
}
