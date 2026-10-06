import type {
  DocumentType,
  VisionAnalysisInput,
  VisionAnalysisResult,
  VisionDashboardBundle,
} from '@vera/vision';

export type AnalyzeDocumentDto = {
  documentType: DocumentType;
  ocrText?: string;
  ocrBlocks?: VisionAnalysisInput['ocrBlocks'];
  imageHints?: VisionAnalysisInput['imageHints'];
  companyId?: number;
  projectId?: number;
  offline?: boolean;
};

export type { VisionAnalysisResult, VisionDashboardBundle };
