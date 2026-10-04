import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SiteContactsController } from './site-contacts.controller';
import { SiteContactsService } from './site-contacts.service';

@Module({
  controllers: [SiteContactsController],
  providers: [SiteContactsService, PrismaService],
  exports: [SiteContactsService],
})
export class SiteContactsModule {}
