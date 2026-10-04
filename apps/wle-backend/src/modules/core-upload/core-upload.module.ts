import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreUploadController } from './core-upload.controller';
import { CoreUploadService } from './core-upload.service';

@Module({
  controllers: [CoreUploadController],
  providers: [CoreUploadService, PrismaService],
  exports: [CoreUploadService],
})
export class CoreUploadModule {}
