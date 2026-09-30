"use client";

import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ReportingChart } from "@/lib/api/reporting";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const palette = [
  "rgb(13, 148, 136)",
  "rgb(245, 158,  11)",
  "rgb(239,  68,  68)",
  "rgb(99,  102, 241)",
  "rgb(107, 114, 128)",
];

export function ReportDonutChart({
  chart,
  title,
}: {
  chart: ReportingChart;
  title?: string;
}) {
  const data = {
    labels: chart.labels,
    datasets: [
      {
        data: chart.values,
        backgroundColor: palette.slice(0, chart.labels.length),
        borderWidth: 0,
      },
    ],
  };

  return (
    <figure className="flex flex-col items-center gap-2">
      {title && <figcaption className="text-sm font-medium">{title}</figcaption>}
      <div className="h-52 w-52">
        <Pie data={data} options={{ plugins: { legend: { position: "bottom" } } }} />
      </div>
    </figure>
  );
}

export function ReportBarChart({
  chart,
  title,
  horizontal,
}: {
  chart: ReportingChart;
  title?: string;
  horizontal?: boolean;
}) {
  const data = horizontal
    ? {
        labels: chart.labels,
        datasets: [
          {
            label: title ?? "Count",
            data: chart.values,
            backgroundColor: palette[0],
          },
        ],
      }
    : {
        labels: chart.labels,
        datasets: [
          {
            label: title ?? "Count",
            data: chart.values,
            backgroundColor: palette.slice(0, chart.labels.length),
          },
        ],
      };

  return (
    <figure className="w-full">
      {title && <figcaption className="mb-2 text-sm font-medium">{title}</figcaption>}
      <div className={horizontal ? "h-64" : "h-52"}>
        <Bar
          data={data}
          options={{
            indexAxis: horizontal ? ("y" as const) : ("x" as const),
            plugins: { legend: { display: !horizontal } },
            scales: { x: { beginAtZero: true }, y: { beginAtZero: true } },
          }}
        />
      </div>
    </figure>
  );
}
