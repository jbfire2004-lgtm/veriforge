export type TopicSuggestionInput = {
  recentIncidents: { id: string; title: string; severity?: string }[];
  recentDeficiencies: { id: string; title: string; score?: number }[];
  highRiskJhas: { id: string; title: string; sifScore?: number }[];
  equipmentFailures: { id: string; title: string }[];
  sifTrendTags: string[];
  weatherAlerts?: string[];
  projectRiskScore?: number;
};

export type TopicSuggestion = {
  title: string;
  categoryCode: string;
  reason: string;
  sourceModule: string;
  sourceId: string;
  priority: number;
  isHighRisk: boolean;
};

export class TopicSuggestEngine {
  suggest(input: TopicSuggestionInput): TopicSuggestion[] {
    const out: TopicSuggestion[] = [];

    for (const inc of input.recentIncidents.slice(0, 5)) {
      out.push({
        title: `Review: ${inc.title}`,
        categoryCode: 'behavioral_safety',
        reason: `Recent incident (${inc.severity ?? 'unknown'} severity)`,
        sourceModule: 'incident',
        sourceId: inc.id,
        priority: inc.severity === 'critical' ? 95 : 70,
        isHighRisk: inc.severity === 'critical' || inc.severity === 'high',
      });
    }

    for (const d of input.recentDeficiencies.slice(0, 5)) {
      out.push({
        title: `Close the loop: ${d.title}`,
        categoryCode: 'general',
        reason: `Open inspection deficiency (score ${d.score ?? 50})`,
        sourceModule: 'inspection',
        sourceId: d.id,
        priority: Math.min(100, (d.score ?? 50) + 20),
        isHighRisk: (d.score ?? 0) >= 75,
      });
    }

    for (const j of input.highRiskJhas.slice(0, 5)) {
      out.push({
        title: `JHA controls: ${j.title}`,
        categoryCode: 'sif_heca',
        reason: `High-risk JHA (SIF score ${j.sifScore ?? 'n/a'})`,
        sourceModule: 'jha_flha',
        sourceId: j.id,
        priority: Math.min(100, (j.sifScore ?? 60) + 15),
        isHighRisk: (j.sifScore ?? 0) >= 70,
      });
    }

    for (const eq of input.equipmentFailures.slice(0, 3)) {
      out.push({
        title: `Equipment safety: ${eq.title}`,
        categoryCode: 'equipment_operation',
        reason: 'Recent equipment failure or lockout',
        sourceModule: 'equipment',
        sourceId: eq.id,
        priority: 80,
        isHighRisk: true,
      });
    }

    for (const tag of input.sifTrendTags.slice(0, 3)) {
      out.push({
        title: `SIF/HECA focus: ${tag}`,
        categoryCode: 'sif_heca',
        reason: 'Elevated SIF/HECA trend on project',
        sourceModule: 'sif_heca',
        sourceId: tag,
        priority: 85,
        isHighRisk: true,
      });
    }

    if ((input.projectRiskScore ?? 0) >= 70) {
      out.push({
        title: 'Project risk profile — leading indicators',
        categoryCode: 'behavioral_safety',
        reason: `Project risk score ${input.projectRiskScore}`,
        sourceModule: 'project',
        sourceId: 'risk_profile',
        priority: 75,
        isHighRisk: true,
      });
    }

    return out.sort((a, b) => b.priority - a.priority).slice(0, 15);
  }
}
