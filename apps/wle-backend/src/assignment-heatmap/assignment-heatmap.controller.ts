import { Controller, Get } from '@nestjs/common';
import { AssignmentHeatmapService } from './assignment-heatmap.service';

@Controller('assignment-heatmap')
export class AssignmentHeatmapController {
  constructor(private readonly heatmap: AssignmentHeatmapService) {}

  @Get('sites')
  siteHeatmap() {
    return this.heatmap.siteHeatmap();
  }
}
