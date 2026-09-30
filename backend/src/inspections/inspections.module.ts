import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';

@Module({
  providers: [PrismaService, InspectionsService],
  controllers: [InspectionsController],
})
export class InspectionsModule {}
