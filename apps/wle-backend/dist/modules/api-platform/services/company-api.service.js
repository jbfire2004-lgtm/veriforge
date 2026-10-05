"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyApiService = void 0;
const common_1 = require("@nestjs/common");
const companies_service_1 = require("../../../companies/companies.service");
const company_repository_1 = require("../repositories/company.repository");
const reporting_core_service_1 = require("../../reporting-core/reporting-core.service");
const api_exception_1 = require("../exceptions/api.exception");
const error_codes_1 = require("../constants/error-codes");
let CompanyApiService = class CompanyApiService {
    constructor(companies, companyRepo, reporting) {
        this.companies = companies;
        this.companyRepo = companyRepo;
        this.reporting = reporting;
    }
    create(body) {
        return this.companies.create(body);
    }
    update(id, body) {
        return this.companies.update(id, body);
    }
    async get(id) {
        const c = await this.companyRepo.findById(id);
        if (!c) {
            throw new api_exception_1.ApiException(error_codes_1.ApiErrorCode.NOT_FOUND, 'Company not found', {
                id,
            });
        }
        return c;
    }
    workers(companyId) {
        return this.companyRepo.listWorkers(companyId);
    }
    equipment(companyId) {
        return this.companyRepo.listEquipmentLinks(companyId);
    }
    compliance(companyId) {
        return this.reporting.companyReadiness(companyId);
    }
};
exports.CompanyApiService = CompanyApiService;
exports.CompanyApiService = CompanyApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService,
        company_repository_1.CompanyRepository,
        reporting_core_service_1.ReportingCoreService])
], CompanyApiService);
//# sourceMappingURL=company-api.service.js.map