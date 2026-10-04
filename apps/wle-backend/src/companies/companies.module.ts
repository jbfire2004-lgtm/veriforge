import { Module } from '@nestjs/common';
import { AssessmentEnginesModule } from '../modules/assessment-engines/assessment-engines.module';
import { PmCompanySafetyContextModule } from '../pm-company-safety-context/pm-company-safety-context.module';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyComplianceUiService } from './company-compliance-ui.service';
import { CompanyTrainingComplianceService } from './company-training-compliance.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AssessmentEnginesModule, PmCompanySafetyContextModule],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    CompanyTrainingComplianceService,
    CompanyComplianceUiService,
    PrismaService,
  ],
  exports: [
    CompaniesService,
    CompanyTrainingComplianceService,
    CompanyComplianceUiService,
  ],
})
export class CompaniesModule {}
