import { PrismaService } from '../../prisma/prisma.service';
export declare class AssessmentExportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    trainingPdf(workerId: number): Promise<Buffer>;
    spcePdf(companyId: number): Promise<Buffer>;
    smartGapPdf(companyId: number, projectId?: number): Promise<Buffer>;
}
