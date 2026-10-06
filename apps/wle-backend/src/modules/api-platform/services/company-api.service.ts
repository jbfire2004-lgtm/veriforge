import { Injectable } from '@nestjs/common';
import { CompaniesService } from '../../../companies/companies.service';
import { CompanyRepository } from '../repositories/company.repository';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import { ApiException } from '../exceptions/api.exception';
import { ApiErrorCode } from '../constants/error-codes';

@Injectable()
export class CompanyApiService {
  constructor(
    private readonly companies: CompaniesService,
    private readonly companyRepo: CompanyRepository,
    private readonly reporting: ReportingCoreService,
  ) {}

  create(body: Record<string, unknown>) {
    return this.companies.create(body as never);
  }

  update(id: number, body: Record<string, unknown>) {
    return this.companies.update(id, body as never);
  }

  async get(id: number) {
    const c = await this.companyRepo.findById(id);
    if (!c) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Company not found', {
        id,
      });
    }
    return c;
  }

  workers(companyId: number) {
    return this.companyRepo.listWorkers(companyId);
  }

  equipment(companyId: number) {
    return this.companyRepo.listEquipmentLinks(companyId);
  }

  compliance(companyId: number) {
    return this.reporting.companyReadiness(companyId);
  }
}
