import { VisionService } from './vision.service';
import type { AnalyzeDocumentDto } from './vision.types';
export declare class VisionController {
    private readonly vision;
    constructor(vision: VisionService);
    analyze(body: AnalyzeDocumentDto): Promise<any>;
    certificate(body: Omit<AnalyzeDocumentDto, 'documentType'>): Promise<any>;
    inspection(body: Omit<AnalyzeDocumentDto, 'documentType'>): Promise<any>;
    equipmentPlate(body: Omit<AnalyzeDocumentDto, 'documentType'>): Promise<any>;
    workerDocument(body: Omit<AnalyzeDocumentDto, 'documentType'> & {
        subtype?: string;
    }): Promise<any>;
    providerDocument(body: Omit<AnalyzeDocumentDto, 'documentType'> & {
        subtype?: string;
    }): Promise<any>;
    projectForm(body: Omit<AnalyzeDocumentDto, 'documentType'>): Promise<any>;
    dashboard(companyId?: string): VisionDashboardBundle;
    capabilities(hasOcrText?: string): import("./vision-capabilities").VisionCapabilities;
}
