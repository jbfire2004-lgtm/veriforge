import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InactivationModule } from './inactivation.module';
import { OrientationModule } from '../orientation/orientation.module';
import { CompanyLinksService } from './company-links.service';

/** Slim module so Workers/FieldSync can link rosters without importing all of VeraCore. */
@Module({
  imports: [PrismaModule, InactivationModule, OrientationModule],
  providers: [CompanyLinksService],
  exports: [CompanyLinksService],
})
export class CompanyLinksModule {}
