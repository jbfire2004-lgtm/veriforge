import { PrismaService } from '../../prisma/prisma.service';
import type { AnalyzeDocumentDto, VisionAnalysisResult, VisionDashboardBundle } from './vision.types';
import { type VisionAnalysisMode, type VisionCapabilities } from './vision-capabilities';
export declare class VisionService {
    private readonly prisma;
    private readonly vve;
    private readonly recentByCompany;
    private readonly candidatesCache;
    constructor(prisma: PrismaService);
    getCapabilities(ocrTextProvided?: boolean): VisionCapabilities;
    analyze(dto: AnalyzeDocumentDto): Promise<VisionAnalysisResult & {
        analysisMode: VisionAnalysisMode;
        capabilities: VisionCapabilities;
    }>;
    analyzeCertificate(dto: Omit<AnalyzeDocumentDto, 'documentType'>): Promise<any>;
    analyzeInspection(dto: Omit<AnalyzeDocumentDto, 'documentType'>): Promise<any>;
    analyzeEquipmentPlate(dto: Omit<AnalyzeDocumentDto, 'documentType'>): Promise<any>;
    getDashboard(companyId?: number): VisionDashboardBundle;
    private loadCandidates;
}
