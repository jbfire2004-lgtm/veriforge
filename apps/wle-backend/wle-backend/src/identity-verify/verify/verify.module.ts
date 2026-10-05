import { Module } from '@nestjs/common';
import { VerifyController } from './verify.controller';
import { VerifyService } from './verify.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [VerifyController],
  providers: [VerifyService, PrismaService],
  exports: [VerifyService],
})
export class VerifyModule {}
