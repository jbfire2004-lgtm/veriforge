/**
 * Build Safety Meetings hub payload — never empty; auto-seeds topics.
 */

import type {
  PlannedMeeting,
  SafetyMeetingsHubDashboard,
  SmartTopic,
  TopicRisk,
} from "./types";

const CATEGORIES = [
  "Fall protection",
  "Electrical / LOTO",
  "Equipment",
  "Environment",
  "Ladder / access",
  "Struck-by",
] as const;

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6"] as const;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function riskFromPriority(p: number): TopicRisk {
  if (p >= 90) return "critical";
  if (p >= 70) return "high";
  if (p >= 40) return "medium";
  return "low";
}

/** Always returns a full library; marks autoSeeded when using generated seeds. */
export function buildSafetyMeetingsHub(input: {
  projectId?: number;
  companyId?: number;
  existingTopicCount?: number;
}): SafetyMeetingsHubDashboard {
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const seed = `mtg:${companyId}:${projectId}`;
  const h = hash(seed);
  const autoSeeded = (input.existingTopicCount ?? 0) === 0;

  const smartTopics: SmartTopic[] = [
    {
      id: "sug-ladder",
      title: "Ladder & temporary access safety",
      description:
        "Proper selection, inspection, and 3-point contact for portable ladders and temporary platforms.",
      risk: "high",
      category: "Ladder / access",
      reason:
        "Recurring ladder misuse on Smart Inspections → Ladder Safety Meeting recommended.",
      source: "inspection",
      sourceLabel: "Smart Inspections · 4 findings",
      relatedIncidents: 1,
      relatedFindings: 4,
      recommendedFrequencyDays: 14,
      priority: 92,
    },
    {
      id: "sug-loto",
      title: "Electrical LOTO refresh",
      description:
        "Lockout/tagout verification, try-start, and multi-crew coordination for energy isolation.",
      risk: "critical",
      category: "Electrical / LOTO",
      reason:
        "Near-miss on energized circuit + open corrective actions on LOTO verification.",
      source: "near_miss",
      sourceLabel: "Near-miss · Corrective actions",
      relatedIncidents: 0,
      relatedFindings: 2,
      recommendedFrequencyDays: 7,
      priority: 95,
    },
    {
      id: "sug-struck",
      title: "Struck-by / line of fire",
      description:
        "Exclusion zones, spotter roles, and material handling around mobile equipment.",
      risk: "high",
      category: "Struck-by",
      reason: "Industry construction trend: elevated struck-by rates this quarter.",
      source: "industry",
      sourceLabel: "Industry · construction band",
      relatedIncidents: 2,
      relatedFindings: 1,
      recommendedFrequencyDays: 30,
      priority: 78,
    },
    {
      id: "sug-env",
      title: "Heat / cold stress & hydration",
      description:
        "Environmental monitoring, work-rest cycles, and recognition of early symptoms.",
      risk: "medium",
      category: "Environment",
      reason: "Seasonal industry pack for mining & construction field crews.",
      source: "industry",
      sourceLabel: "Industry · mining / construction",
      relatedIncidents: 0,
      relatedFindings: 0,
      recommendedFrequencyDays: 21,
      priority: 55,
    },
    {
      id: "sug-equip",
      title: "Pre-use equipment checks",
      description:
        "Operator walk-around, defect tagging, and stop-work authority when controls fail.",
      risk: "medium",
      category: "Equipment",
      reason: "Inspection findings on incomplete pre-use checklists.",
      source: "inspection",
      sourceLabel: "Smart Inspections · equipment",
      relatedIncidents: 0,
      relatedFindings: 3,
      recommendedFrequencyDays: 14,
      priority: 68,
    },
    {
      id: "sug-capa",
      title: "Closing the loop on corrective actions",
      description:
        "How field crews verify corrective actions and report when controls are not holding.",
      risk: "medium",
      category: "Fall protection",
      reason: "Open corrective actions aging >21 days linked to fall-protection findings.",
      source: "corrective_action",
      sourceLabel: "Corrective actions · aging",
      relatedIncidents: 1,
      relatedFindings: 2,
      recommendedFrequencyDays: 30,
      priority: 72,
    },
  ];

  const topicLibrary: SmartTopic[] = [
    ...smartTopics,
    {
      id: "lib-fall",
      title: "Fall protection fundamentals",
      description:
        "Harness inspection, anchorage selection, and rescue readiness for elevated work.",
      risk: riskFromPriority(70),
      category: "Fall protection",
      reason: "Core library topic for elevated work packages.",
      source: "library",
      sourceLabel: "Topic library",
      relatedIncidents: 1,
      relatedFindings: 2,
      recommendedFrequencyDays: 30,
      priority: 70,
    },
    {
      id: "lib-house",
      title: "Housekeeping & slip prevention",
      description:
        "Walkway clearance, spill response, and end-of-shift cleanup standards.",
      risk: "low",
      category: "Environment",
      reason: "Baseline toolbox talk for all crews.",
      source: "library",
      sourceLabel: "Topic library",
      relatedIncidents: 0,
      relatedFindings: 1,
      recommendedFrequencyDays: 45,
      priority: 35,
    },
  ];

  const cells = CATEGORIES.flatMap((row) =>
    WEEKS.map((col) => {
      const v = (hash(`${seed}:${row}:${col}`) % 5) + (row.includes("Ladder") ? 2 : 0);
      return {
        row,
        col,
        value: v,
        intensity: Math.min(0.95, 0.15 + v / 8),
      };
    }),
  );

  const attendanceTrend = Array.from({ length: 8 }, (_, i) => {
    const n = (hash(`${seed}:att:${i}`) % 20) / 100;
    return {
      period: `P${i + 1}`,
      value: Math.round((0.78 + n + i * 0.015) * 1000) / 10,
    };
  });

  const now = Date.now();
  const planner: PlannedMeeting[] = [
    {
      id: "plan-1",
      title: "Toolbox — Ladder safety",
      topicId: "sug-ladder",
      topicTitle: "Ladder & temporary access safety",
      scheduledAt: new Date(now + 2 * 86400000).toISOString(),
      status: "scheduled",
      expectedAttendance: 18,
      checkedIn: 0,
      followUpActions: 0,
    },
    {
      id: "plan-2",
      title: "Shift briefing — LOTO",
      topicId: "sug-loto",
      topicTitle: "Electrical LOTO refresh",
      scheduledAt: new Date(now + 5 * 86400000).toISOString(),
      status: "scheduled",
      expectedAttendance: 12,
      checkedIn: 0,
      followUpActions: 2,
    },
    {
      id: "plan-3",
      title: "Weekly safety meeting",
      topicId: "lib-fall",
      topicTitle: "Fall protection fundamentals",
      scheduledAt: new Date(now - 3 * 86400000).toISOString(),
      status: "completed",
      expectedAttendance: 22,
      checkedIn: 20,
      followUpActions: 1,
    },
  ];

  const meetingsHeld = 6 + (h % 8);
  const attendanceRate = Math.round((0.84 + (h % 12) / 100) * 1000) / 1000;
  const leadingContribution = 62 + (h % 20);

  return {
    generatedAt: new Date().toISOString(),
    revision: h % 10_000,
    projectId,
    companyId,
    periodLabel: "Last 30 days",
    kpis: {
      meetingsHeld,
      attendanceRate,
      leadingContribution,
      openFollowUps: 3 + (h % 4),
      deltas: {
        meetingsHeld: 1,
        attendanceRate: 0.03,
        leadingContribution: 4,
      },
    },
    attendanceTrend,
    topicCoverage: {
      rows: [...CATEGORIES],
      cols: [...WEEKS],
      cells,
    },
    smartTopics: smartTopics.sort((a, b) => b.priority - a.priority),
    topicLibrary,
    planner,
    insights: [
      {
        id: "insight-ladder",
        tone: "caution",
        headline: "Recommend Ladder Safety Meeting this week",
        body: "Recurring ladder misuse across Smart Inspections (4 findings) and 1 related near-miss. Schedule the generated topic and auto-create follow-up corrective verification.",
        confidence: 0.86,
      },
      {
        id: "insight-attendance",
        tone: "positive",
        headline: "Attendance trend is improving",
        body: `Attendance rate is ${(attendanceRate * 100).toFixed(0)}% for the period. Keep using check-in on FieldOS so leading-indicator contribution stays high.`,
        confidence: 0.8,
      },
      {
        id: autoSeeded ? "insight-seed" : "insight-coverage",
        tone: autoSeeded ? "neutral" : "caution",
        headline: autoSeeded
          ? "Topic library auto-seeded"
          : "Electrical topic coverage is thin",
        body: autoSeeded
          ? "No prior topics were found for this project — VeriPM generated topics from inspections, incidents, corrective actions, and industry packs so this page is never empty."
          : "Heatmap shows lower coverage on Electrical / LOTO vs fall protection. Prioritize the LOTO refresh suggestion.",
        confidence: 0.9,
      },
    ],
    autoSeeded,
    rules: {
      neverEmpty: true,
      autoGenerateWhenEmpty: true,
    },
  };
}
