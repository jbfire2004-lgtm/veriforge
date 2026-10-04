import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExpertQaController } from './expert-qa.controller';
import { ExpertQaAdminController } from './expert-qa-admin.controller';
import { ExpertQaService } from './expert-qa.service';
import { ExpertProfileService } from './expert-profile.service';
import { ExpertQaFeedIntegration } from './expert-qa-feed.integration';

@Module({
  imports: [PrismaModule],
  controllers: [ExpertQaController, ExpertQaAdminController],
  providers: [ExpertQaService, ExpertProfileService, ExpertQaFeedIntegration],
  exports: [ExpertQaService, ExpertProfileService, ExpertQaFeedIntegration],
})
export class VeraExpertQaModule {}
