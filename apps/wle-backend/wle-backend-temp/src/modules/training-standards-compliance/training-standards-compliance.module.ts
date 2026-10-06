import { Module, forwardRef } from '@nestjs/common';
import { Phase1MonitoringModule } from '../../common/monitoring/phase1-monitoring.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CredentialLedgerModule } from '../credential-ledger/credential-ledger.module';
import { StandardsMatchingEngine } from './engines/standards-matching.engine';
import { JurisdictionMatchingEngine } from './engines/jurisdiction-matching.engine';
import { ExpiryRuleEngine } from './engines/expiry-rule.engine';
import { CertificateValidationEngine } from './engines/certificate-validation.engine';
import { ProviderQualificationValidator } from './validators/provider-qualification.validator';
import { InstructorQualificationValidator } from './validators/instructor-qualification.validator';
import { StandardsCatalogService } from './standards-catalog.service';
import { TrainingStandardsComplianceService } from './training-standards-compliance.service';
import { TrainingStandardsComplianceController } from './training-standards-compliance.controller';
import { RegulatoryDecisionService } from './regulatory/regulatory-decision.service';
import { RegulatoryEquivalencyService } from './regulatory/regulatory-equivalency.service';
import { TrainingCredentialNftModule } from '../training-credential-nft/training-credential-nft.module';

@Module({
  imports: [
    PrismaModule,
    Phase1MonitoringModule,
    CredentialLedgerModule,
    forwardRef(() => TrainingCredentialNftModule),
  ],
  controllers: [TrainingStandardsComplianceController],
  providers: [
    StandardsCatalogService,
    TrainingStandardsComplianceService,
    RegulatoryDecisionService,
    RegulatoryEquivalencyService,
    StandardsMatchingEngine,
    JurisdictionMatchingEngine,
    ExpiryRuleEngine,
    CertificateValidationEngine,
    ProviderQualificationValidator,
    InstructorQualificationValidator,
  ],
  exports: [
    TrainingStandardsComplianceService,
    StandardsCatalogService,
    RegulatoryDecisionService,
    RegulatoryEquivalencyService,
  ],
})
export class TrainingStandardsComplianceModule {}
