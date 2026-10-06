import { Injectable } from '@nestjs/common';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import { VerificationService } from '../../../verification/verification.service';
import { ComplianceRepository } from '../repositories/compliance.repository';
import { ApiException } from '../exceptions/api.exception';
import { ApiErrorCode } from '../constants/error-codes';

@Injectable()
export class ComplianceApiService {
  constructor(
    private readonly reporting: ReportingCoreService,
    private readonly verification: VerificationService,
    private readonly complianceRepo: ComplianceRepository,
  ) {}

  async workerCompliance(workerId: number) {
    const status = await this.verification.evaluateWorkerCompliance(workerId);
    if (!status) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Worker not found', {
        workerId,
      });
    }
    return status;
  }

  equipmentCompliance(companyId?: number) {
    return this.reporting.equipmentCompliance(companyId);
  }

  projectReadiness(companyId?: number, projectId?: number) {
    return this.reporting.projectReadiness(companyId, projectId);
  }

  trainingExpiry(companyId?: number) {
    return this.complianceRepo.trainingExpiryCounts(companyId);
  }
}
