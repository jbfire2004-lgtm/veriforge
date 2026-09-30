export type ReadinessVisualState = "OK" | "AT_RISK" | "NON_COMPLIANT";

export type ReadinessDimension = {
  key: string;
  label: string;
  score: number;
  state: ReadinessVisualState;
  metrics: Record<string, number>;
  evaluatedAt?: string | null;
};

export const READINESS_STATE_LABELS: Record<ReadinessVisualState, string> = {
  OK: "OK",
  AT_RISK: "At risk",
  NON_COMPLIANT: "Non-compliant",
};

export function readinessStateStyles(state: ReadinessVisualState) {
  switch (state) {
    case "OK":
      return {
        badge: "bg-teal-100 text-teal-900",
        card: "border-teal-200 bg-teal-50/40",
        score: "text-teal-900",
      };
    case "AT_RISK":
      return {
        badge: "bg-amber-100 text-amber-900",
        card: "border-amber-200 bg-amber-50/60",
        score: "text-amber-900",
      };
    case "NON_COMPLIANT":
      return {
        badge: "bg-red-100 text-red-900",
        card: "border-red-200 bg-red-50/60",
        score: "text-red-900",
      };
  }
}

export function scoreToVisualState(score: number, critical = 0): ReadinessVisualState {
  if (critical > 0 || score < 50) return "NON_COMPLIANT";
  if (score < 85) return "AT_RISK";
  return "OK";
}
