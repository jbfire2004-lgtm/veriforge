export type {
  IntelligenceBundle,
  Recommendation,
  Anomaly,
  NlpResponse,
  RiskLevel,
  ScoreResult,
  PredictionResult,
} from "@vera/intelligence";

export type IntelligenceWidgetsBundle = {
  generatedAt: string;
  predictiveCompliance?: { probability: number; label: string };
  predictiveExpiry?: { expired30: number; expired60: number };
  predictiveReadiness?: { average: number };
  predictiveRisk?: { level: string; score: number };
  anomalies?: { id: string; severity: string; message: string }[];
  recommendations?: {
    id: string;
    title: string;
    description: string;
    priority: number;
    actionHref?: string;
  }[];
};
