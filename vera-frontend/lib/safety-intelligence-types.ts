export type CailSourceType =
  | "inspection"
  | "bbo"
  | "incident"
  | "equipment"
  | "jha"
  | "flha"
  | "heca"
  | "sif"
  | "training"
  | "general";

export type CailStatus =
  | "open"
  | "in_progress"
  | "overdue"
  | "resolved"
  | "verified"
  | "cancelled";
