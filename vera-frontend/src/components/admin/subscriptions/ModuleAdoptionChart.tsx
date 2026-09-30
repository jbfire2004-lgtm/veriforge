"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { MODULE_OPTIONS } from "./tier-colors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
  adoptionByModule: Record<string, number>;
  totalCompanies: number;
};

export function ModuleAdoptionChart({ adoptionByModule, totalCompanies }: Props) {
  const labels = MODULE_OPTIONS.map((m) => m.label);
  const counts = MODULE_OPTIONS.map((m) => adoptionByModule[m.id] ?? 0);
  const pct = counts.map((c) =>
    totalCompanies > 0 ? Math.round((c / totalCompanies) * 100) : 0,
  );

  return (
    <div className="rounded-xl border border-vera-charcoal/10 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-vera-charcoal">Module adoption</h3>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Companies",
              data: counts,
              backgroundColor: "#2F8F8C",
            },
            {
              label: "% of all companies",
              data: pct,
              backgroundColor: "#94a3b8",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                afterLabel: (ctx) => {
                  if (ctx.datasetIndex === 1) return `${pct[ctx.dataIndex]}%`;
                  return "";
                },
              },
            },
          },
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  );
}
