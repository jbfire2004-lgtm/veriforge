import { Module } from '@nestjs/common';
import { OrientationController } from './orientation.controller';
import { OrientationService } from './orientation.service';
import { OrientationAiService } from './orientation-ai.service';
import { OrientationTranslationService } from './orientation-translation.service';
import { OrientationLinkingService } from './orientation-linking.service';
import { OrientationCoreIntegrationService } from './orientation-core-integration.service';
import { OrientationAccessService } from './orientation-access.service';
import { OrientationUploadService } from './orientation-upload.service';
import { OrientationDefinitionService } from './veriforge/orientation-definition.service';
import { OrientationRequirementService } from './veriforge/orientation-requirement.service';
import { OrientationCompletionService } from './veriforge/orientation-completion.service';
import { WorkerOrientationProfileService } from './veriforge/worker-orientation-profile.service';
import { OrientationAiGenerateService } from './veriforge/orientation-ai-generate.service';
import { OrientationDeliveryService } from './veriforge/orientation-delivery.service';
import { OrientationDefinitionController } from './veriforge/orientation-definition.controller';
import { OrientationRequirementController } from './veriforge/orientation-requirement.controller';
import { OrientationCompletionController } from './veriforge/orientation-completion.controller';
import { WorkerOrientationProfileController } from './veriforge/worker-orientation-profile.controller';
import { OrientationAiController } from './veriforge/orientation-ai.controller';
import { OrientationDeliveryController } from './veriforge/orientation-delivery.controller';

@Module({
  controllers: [
    OrientationController,
    OrientationDefinitionController,
    OrientationRequirementController,
    OrientationCompletionController,
    WorkerOrientationProfileController,
    OrientationAiController,
    OrientationDeliveryController,
  ],
  providers: [
    OrientationService,
    OrientationAiService,
    OrientationTranslationService,
    OrientationLinkingService,
    OrientationCoreIntegrationService,
    OrientationAccessService,
    OrientationUploadService,
    OrientationDefinitionService,
    OrientationRequirementService,
    OrientationCompletionService,
    WorkerOrientationProfileService,
    OrientationAiGenerateService,
    OrientationDeliveryService,
  ],
  exports: [
    OrientationService,
    OrientationLinkingService,
    OrientationAccessService,
    OrientationCoreIntegrationService,
    OrientationDefinitionService,
    OrientationRequirementService,
    OrientationCompletionService,
    WorkerOrientationProfileService,
    OrientationDeliveryService,
  ],
})
export class OrientationModule {}
