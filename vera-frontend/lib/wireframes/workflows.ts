import type { LucideIcon } from "lucide-react";
import { HardHat, Upload, UserPlus, UserRound } from "lucide-react";

export type WorkflowWireframeId =
  | "addWorker"
  | "addEquipment"
  | "uploadTraining"
  | "assignProject";

export type WorkflowStepWireframe = {
  id: string;
  title: string;
  description: string;
};

export type WorkflowWireframe = {
  id: WorkflowWireframeId;
  title: string;
  icon: LucideIcon;
  steps: WorkflowStepWireframe[];
};

export const WORKFLOW_WIREFRAMES: Record<WorkflowWireframeId, WorkflowWireframe> = {
  addWorker: {
    id: "addWorker",
    title: "Add worker",
    icon: UserPlus,
    steps: [
      { id: "info", title: "Worker info", description: "Name, trade, contact" },
      { id: "company", title: "Company link", description: "Employer or QR import" },
      {
        id: "training",
        title: "Training upload",
        description: "Optional certificates",
      },
      { id: "review", title: "Review & confirm", description: "Save to roster" },
    ],
  },
  addEquipment: {
    id: "addEquipment",
    title: "Add equipment",
    icon: HardHat,
    steps: [
      { id: "info", title: "Equipment info", description: "Type, tag, specs" },
      { id: "company", title: "Company link", description: "Owner assignment" },
      {
        id: "inspection",
        title: "Inspection setup",
        description: "Schedule and templates",
      },
      { id: "review", title: "Review & confirm", description: "Activate asset" },
    ],
  },
  uploadTraining: {
    id: "uploadTraining",
    title: "Upload training",
    icon: Upload,
    steps: [
      {
        id: "source",
        title: "Provider or manual",
        description: "Select training source",
      },
      { id: "match", title: "Worker matching", description: "Match roster rows" },
      {
        id: "cert",
        title: "Certificate upload",
        description: "Attach proof documents",
      },
      {
        id: "validate",
        title: "Compliance validation",
        description: "Standards engine check",
      },
      { id: "confirm", title: "Confirmation", description: "Push to wallets" },
    ],
  },
  assignProject: {
    id: "assignProject",
    title: "Assign to project",
    icon: UserRound,
    steps: [
      {
        id: "select",
        title: "Select worker/equipment",
        description: "Choose resources",
      },
      { id: "project", title: "Select project", description: "Target site" },
      {
        id: "compliance",
        title: "Compliance check",
        description: "Readiness gates",
      },
      { id: "confirm", title: "Confirm assignment", description: "Activate on site" },
    ],
  },
};
