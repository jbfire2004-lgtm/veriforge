"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { SubscriptionGrowth } from "@/lib/admin-subscriptions-api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function sortedMonths(...maps: Record<string, number>[]): string[] {
  const keys = new Set<string>();
  for (const m of maps) {
    for (const k of Object.keys(m)) keys.add(k);
  }
  return [...keys].sort();
}

type Props = {
  growth: SubscriptionGrowth;
};

export function GrowthTimeline({ growth }: Props) {
  const months = sortedMonths(
    growth.newCompaniesByMonth,
    growth.newUsersByMonth,
    growth.seatUpgradesByMonth,
  );

  return (
    <div className="rounded-xl border border-vera-charcoal/10 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-vera-charcoal">Growth timeline</h3>
      <Line
        data={{
          labels: months,
          datasets: [
            {
              label: "New companies",
              data: months.map((m) => growth.newCompaniesByMonth[m] ?? 0),
              borderColor: "#1E6FB8",
              tension: 0.25,
            },
            {
              label: "New users",
              data: months.map((m) => growth.newUsersByMonth[m] ?? 0),
              borderColor: "#2F8F8C",
              tension: 0.25,
            },
            {
              label: "Seat upgrades",
              data: months.map((m) => growth.seatUpgradesByMonth[m] ?? 0),
              borderColor: "#7c3aed",
              tension: 0.25,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  );
}
