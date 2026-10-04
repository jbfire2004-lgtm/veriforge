import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignoffService } from './signoff.service';
import { SignoffController } from './signoff.controller';

@Module({
  providers: [PrismaService, SignoffService],
  controllers: [SignoffController],
})
export class SignoffModule {}
