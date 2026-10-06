import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreActionItemsController } from './core-action-items.controller';
import { CoreActionItemsService } from './core-action-items.service';

@Module({
  controllers: [CoreActionItemsController],
  providers: [CoreActionItemsService, PrismaService],
  exports: [CoreActionItemsService],
})
export class CoreActionItemsModule {}
