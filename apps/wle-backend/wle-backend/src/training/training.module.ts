import { Module } from '@nestjs/common';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * TrainingModule registers the aggregate `/training` HTTP surface
 * (`/training`, `/training/worker/:id`, `/training/company/:id/summary`,
 * `/training/certifications`, ...) consumed by the admin dashboard and
 * legacy clients per the API contract. The matrix (`/training/matrix`)
 * controller still lives in its own `MatrixModule` (`./matrix.module`).
 */
@Module({
  imports: [PrismaModule],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
