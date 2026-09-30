/**
 * VeriPM Safety Meetings Hub — smart interactive dashboard types.
 */

export type TopicRisk = "low" | "medium" | "high" | "critical";

export type TopicSource =
  | "inspection"
  | "incident"
  | "near_miss"
  | "corrective_action"
  | "industry"
  | "library";

export type SmartTopic = {
  id: string;
  title: string;
  description: string;
  risk: TopicRisk;
  category: string;
  reason: string;
  source: TopicSource;
  sourceLabel: string;
  relatedIncidents: number;
  relatedFindings: number;
  recommendedFrequencyDays: number;
  priority: number;
};

export type PlannedMeeting = {
  id: string;
  title: string;
  topicId: string;
  topicTitle: string;
  scheduledAt: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  expectedAttendance: number;
  checkedIn: number;
  followUpActions: number;
};

export type SafetyMeetingsHubDashboard = {
  generatedAt: string;
  revision: number;
  projectId: number;
  companyId: number;
  periodLabel: string;
  kpis: {
    meetingsHeld: number;
    attendanceRate: number;
    leadingContribution: number;
    openFollowUps: number;
    deltas: {
      meetingsHeld: number;
      attendanceRate: number;
      leadingContribution: number;
    };
  };
  attendanceTrend: Array<{ period: string; value: number }>;
  topicCoverage: {
    rows: string[];
    cols: string[];
    cells: Array<{ row: string; col: string; value: number; intensity: number }>;
  };
  smartTopics: SmartTopic[];
  topicLibrary: SmartTopic[];
  planner: PlannedMeeting[];
  insights: Array<{
    id: string;
    tone: "neutral" | "positive" | "caution" | "alert";
    headline: string;
    body: string;
    confidence: number;
  }>;
  autoSeeded: boolean;
  rules: {
    neverEmpty: true;
    autoGenerateWhenEmpty: true;
  };
};
