import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ToolsPpeCoreController } from './tools-ppe-core.controller';
import { ToolsPpeCoreService } from './tools-ppe-core.service';

@Module({
  imports: [PrismaModule],
  controllers: [ToolsPpeCoreController],
  providers: [ToolsPpeCoreService],
  exports: [ToolsPpeCoreService],
})
export class ToolsPpeCoreModule {}
