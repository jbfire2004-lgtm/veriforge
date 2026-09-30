"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CALCULATOR_TOOLS } from "@/lib/calculators/registry";
import { WorkspaceHero } from "@/components/theme/workspace";

export function CalculatorsHubView() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <WorkspaceHero
        eyebrow="Vera Hub"
        title="Safety Calculators"
        description="Rigging, fall clearance, crane radius, and confined space ventilation — quick field estimates."
        badges={[{ label: "Field tools", tone: "teal" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {CALCULATOR_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[#2A2E33]/10 bg-gradient-to-br ${tool.surface} p-5 shadow-md ring-1 ring-[#2A2E33]/10 transition hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tool.accent}`}
                aria-hidden
              />
              <div className="flex items-start gap-4">
                <span
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.accent} text-white shadow-md`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-[#2A2E33]">{tool.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#5a6b7c]">
                    {tool.description}
                  </p>
                </div>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 self-start text-xs font-bold uppercase tracking-[0.08em] text-[#2F8F8C] transition group-hover:gap-2">
                Open calculator
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>

      <p className="text-center text-xs text-[#64748b]">
        Estimates only — follow manufacturer specs, lift plans, and applicable regulations.
      </p>
    </div>
  );
}
