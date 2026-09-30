import type { DocumentType, VisionAnalysisResult, VisionDashboardBundle } from "@vera/vision";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export type AnalyzeDocumentRequest = {
  documentType: DocumentType;
  ocrText?: string;
  companyId?: number;
  projectId?: number;
  offline?: boolean;
  imageHints?: {
    hasSignature?: boolean;
    hasStamp?: boolean;
    hasQr?: boolean;
    hazards?: string[];
  };
};

export async function analyzeDocument(
  body: AnalyzeDocumentRequest
): Promise<VisionAnalysisResult> {
  return apiAxiosPost<VisionAnalysisResult>("/api/v1/vision/analyze", body);
}

export async function analyzeCertificate(
  ocrText: string,
  companyId?: number
): Promise<VisionAnalysisResult> {
  return apiAxiosPost<VisionAnalysisResult>("/api/v1/vision/certificate", {
    ocrText,
    companyId,
  });
}

export async function fetchVisionDashboard(
  companyId?: number
): Promise<VisionDashboardBundle> {
  return apiAxiosGet<VisionDashboardBundle>("/api/v1/vision/dashboard", {
    params: { companyId },
  });
}
