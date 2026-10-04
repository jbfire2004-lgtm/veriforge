import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { STAFF_ROLES, COMPANY_ADMIN_ROLES } from '../vera-core/roles';
import { TrainingCredentialNftCoordinatorService } from './training-credential-nft-coordinator.service';
import { TrainingCredentialNftProjectionService } from './training-credential-nft-projection.service';
import { TrainingCredentialNftRegistryService } from './training-credential-nft-registry.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/training-credential-nft`)
export class TrainingCredentialNftController {
  constructor(
    private readonly projection: TrainingCredentialNftProjectionService,
    private readonly registry: TrainingCredentialNftRegistryService,
    private readonly coordinator: TrainingCredentialNftCoordinatorService,
  ) {}

  @Get('projection/training/:trainingRecordId')
  @Roles(...STAFF_ROLES)
  getProjection(@Param('trainingRecordId', ParseIntPipe) id: number) {
    return this.projection.getProjection(id);
  }

  @Get('training/:trainingRecordId')
  @Roles(...STAFF_ROLES)
  getNft(@Param('trainingRecordId', ParseIntPipe) id: number) {
    return this.registry.findByTrainingRecordId(id);
  }

  @Post('training/:trainingRecordId/retry-mint')
  @Roles(...COMPANY_ADMIN_ROLES)
  retryMint(@Param('trainingRecordId', ParseIntPipe) id: number) {
    return this.coordinator.scheduleMintIfEligible(id);
  }
}
