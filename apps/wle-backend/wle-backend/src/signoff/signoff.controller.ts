import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SignoffService } from './signoff.service';
import { CreatePreUseSignoffDto } from './dto/create-preuse-signoff.dto';

@Controller('signoff')
export class SignoffController {
  constructor(private readonly service: SignoffService) {}

  @Post('preuse')
  create(@Body() body: CreatePreUseSignoffDto) {
    return this.service.create(body);
  }

  @Get('history')
  history() {
    return this.service.history();
  }

  @Get('recent')
  recent() {
    return this.service.recent();
  }

  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Get('analytics')
  analytics() {
    return this.service.analytics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }
}
