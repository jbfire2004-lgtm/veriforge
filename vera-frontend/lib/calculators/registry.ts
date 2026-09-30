import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  Box,
  Construction,
  Wind,
} from "lucide-react";

export type CalculatorTool = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  surface: string;
};

export const CALCULATOR_TOOLS: CalculatorTool[] = [
  {
    id: "fall-clearance",
    title: "Fall clearance",
    description: "Required clearance below a fall arrest anchor.",
    href: "/calculators/fall-clearance",
    icon: ArrowDown,
    accent: "from-[#2F8F8C] to-[#3AA39F]",
    surface: "from-[#E4F3F2]/90 via-[#E4F3F2] to-white",
  },
  {
    id: "sling-angle",
    title: "Sling angle / load",
    description: "Tension per leg for symmetric rigging.",
    href: "/calculators/sling-angle",
    icon: Box,
    accent: "from-[#1e4a7a] to-[#2F85CC]",
    surface: "from-[#dbeafe]/80 via-[#f0f6fc] to-white",
  },
  {
    id: "crane-radius",
    title: "Crane radius estimator",
    description: "Horizontal reach from boom length and angle.",
    href: "/calculators/crane-radius",
    icon: Construction,
    accent: "from-[#d97706] to-[#C89F3D]",
    surface: "from-[#fef3c7]/90 via-[#fffbeb] to-white",
  },
  {
    id: "confined-space",
    title: "Confined space ventilation",
    description: "Time to achieve target air changes.",
    href: "/calculators/confined-space",
    icon: Wind,
    accent: "from-[#475569] to-[#64748b]",
    surface: "from-[#f1f5f9]/90 via-[#f8fafc] to-white",
  },
];
