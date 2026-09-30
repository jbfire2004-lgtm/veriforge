import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller()
export class AppController {
  @Get('test-prisma')
  async testPrisma() {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    return { prisma: 'connected', result };
  }
}
