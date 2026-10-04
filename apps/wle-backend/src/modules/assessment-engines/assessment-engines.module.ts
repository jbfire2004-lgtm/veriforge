import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FitTestModule } from '../fit-test/fit-test.module';
import { AssessmentEnginesController } from './assessment-engines.controller';
import { AssessmentEnginesService } from './assessment-engines.service';
import { TrainingAssessmentRunnerService } from './training-assessment-runner.service';
import { AssessmentExportService } from './assessment-export.service';

@Module({
  imports: [PrismaModule, FitTestModule],
  controllers: [AssessmentEnginesController],
  providers: [
    AssessmentEnginesService,
    TrainingAssessmentRunnerService,
    AssessmentExportService,
  ],
  exports: [
    AssessmentEnginesService,
    TrainingAssessmentRunnerService,
    AssessmentExportService,
  ],
})
export class AssessmentEnginesModule {}
