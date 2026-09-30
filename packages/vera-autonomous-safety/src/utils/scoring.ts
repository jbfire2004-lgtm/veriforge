import type { SafetyScore } from "../types";

export function safetyScore(factors: { weight: number; value: number }[]): SafetyScore {
  const total = factors.reduce((s, f) => s + f.weight, 0) || 1;
  const score = Math.round(
    factors.reduce((s, f) => s + (f.value * f.weight) / total, 0)
  );
  const clamped = Math.max(0, Math.min(100, score));
  return {
    score: clamped,
    level: levelFromScore(clamped),
    updatedAt: new Date().toISOString(),
  };
}

export function levelFromScore(score: number): SafetyScore["level"] {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function extractHazards(text: string): string[] {
  const hazards: string[] = [];
  const patterns: { tag: string; re: RegExp }[] = [
    { tag: "fall", re: /fall|height|ladder|scaffold/i },
    { tag: "struck_by", re: /struck|swing|load|crane/i },
    { tag: "caught_in", re: /caught|pinch|nip point/i },
    { tag: "electrical", re: /electrical|arc|shock|energized/i },
    { tag: "chemical", re: /chemical|toxic|fume|spill/i },
    { tag: "pressure", re: /pressure|hydraulic|pneumatic/i },
    { tag: "thermal", re: /heat|burn|fire|weld/i },
    { tag: "radiation", re: /radiation|laser|uv/i },
    { tag: "biological", re: /biological|blood|pathogen/i },
  ];
  for (const p of patterns) {
    if (p.re.test(text)) hazards.push(p.tag);
  }
  return [...new Set(hazards)];
}
