"use client";

import { cn } from "@/src/lib/utils";
import type { ContractorGrade, ContractorScoreStatus } from "@/lib/contractor-safety-score/types";

function gradeTone(grade: ContractorGrade) {
  if (grade === "A") return "border-[#4FAF6F]/50 bg-[#E8F6EE] text-[#2A2E33]";
  if (grade === "B") return "border-[#1E6FB8]/40 bg-[#E8F1F8] text-[#2A2E33]";
  if (grade === "C") return "border-[#C89F3D]/50 bg-[#FBF8F0] text-[#2A2E33]";
  return "border-[#B33A3A]/40 bg-[#F8ECEC] text-[#2A2E33]";
}

export function ContractorScoreBadge({
  overallScore,
  grade,
  status = "current",
  size = "md",
  onClick,
  className,
}: {
  overallScore: number;
  grade: ContractorGrade;
  status?: ContractorScoreStatus;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-[3px] border font-semibold tabular-nums",
        gradeTone(grade),
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        size === "lg" && "px-3 py-1.5 text-base",
        status === "stale" && "opacity-70",
        onClick && "cursor-pointer hover:brightness-95",
        className,
      )}
    >
      <span>{Math.round(overallScore)}</span>
      <span>{grade}</span>
      {status === "stale" ? <span className="text-[10px] font-medium">Updating</span> : null}
      {status === "insufficient_data" ? (
        <span className="text-[10px] font-medium">Incomplete</span>
      ) : null}
    </Comp>
  );
}
