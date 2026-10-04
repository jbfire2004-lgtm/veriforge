import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Public } from './auth/public.decorator';

const prisma = new PrismaClient();

@Controller()
export class AppController {
  @Public()
  @Get('test-prisma')
  async testPrisma() {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    return { prisma: 'connected', result };
  }
}
