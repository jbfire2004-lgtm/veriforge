import { AssessmentEnginesService } from '../modules/assessment-engines/assessment-engines.service';
import { PmCompanySafetyCailIntelligenceService } from '../pm-company-safety-context/pm-company-safety-cail-intelligence.service';
import { CompaniesService, type CompanyActor } from './companies.service';
import { CompanyTrainingComplianceService } from './company-training-compliance.service';
import type { CompanyComplianceOverviewDto, CompanyScoreDto } from './company-compliance-ui.types';
export declare class CompanyComplianceUiService {
    private readonly companies;
    private readonly trainingCompliance;
    private readonly assessmentEngines;
    private readonly cail;
    constructor(companies: CompaniesService, trainingCompliance: CompanyTrainingComplianceService, assessmentEngines: AssessmentEnginesService, cail: PmCompanySafetyCailIntelligenceService);
    getComplianceOverview(companyId: number, actor?: CompanyActor): Promise<CompanyComplianceOverviewDto>;
    getCompanyScore(companyId: number, actor?: CompanyActor): Promise<CompanyScoreDto>;
}
