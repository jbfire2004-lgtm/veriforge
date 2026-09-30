import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MatrixService } from './matrix.service';

@Controller('training/matrix')
export class MatrixController {
  constructor(private readonly service: MatrixService) {}

  @Get(':companyId')
  matrix(@Param('companyId', ParseIntPipe) id: number) {
    return this.service.matrix(id);
  }
}
