import type { LucideIcon } from "lucide-react";
import type { ModuleTabId } from "@/lib/navigation/types";

export type ModuleId =
  | "workers"
  | "equipment"
  | "training"
  | "trainingProviders"
  | "unionHalls"
  | "projects";

export type FilterChip = {
  id: string;
  label: string;
};

export type ListColumnDef = {
  id: string;
  header: string;
  /** Mobile card: show in subtitle line */
  mobilePrimary?: boolean;
  mobileSecondary?: boolean;
};

export type ModuleWireframe = {
  id: ModuleId;
  title: string;
  description: string;
  listPath: string;
  detailPath: (id: string | number) => string;
  filters: FilterChip[];
  columns: ListColumnDef[];
  tabs: ModuleTabId[];
  /** Primary create action label */
  createLabel?: string;
  icon: LucideIcon;
};
