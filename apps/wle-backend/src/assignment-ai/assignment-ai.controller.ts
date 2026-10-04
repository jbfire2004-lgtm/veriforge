import { Controller, Get, Query } from '@nestjs/common';
import { AssignmentAIService } from './assignment-ai.service';

@Controller('assignment-ai')
export class AssignmentAIController {
  constructor(private readonly ai: AssignmentAIService) {}

  @Get('suggest')
  suggest(
    @Query('equipmentId') equipmentId?: string,
    @Query('siteId') siteId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.ai.suggest({
      equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
      siteId: siteId ? parseInt(siteId, 10) : undefined,
      companyId: parseInt(companyId!, 10),
    });
  }
}
