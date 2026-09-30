"use client";

import { useMemo } from "react";

/** Mirrors Prisma `ToolboxTalk` (+ nested facilitator for display). */
export type ToolboxTalkListItem = {
  id: number;
  siteId: number;
  title: string;
  topic: string | null;
  notes: string | null;
  conductedAt: string | Date;
  facilitator: {
    firstName: string;
    lastName: string;
  } | null;
};

type ToolboxTalksPanelProps = {
  /** Optional label when embedding on a site detail page */
  siteName?: string;
  talks: ToolboxTalkListItem[];
  loading?: boolean;
  error?: string | null;
  /** Shown when `talks.length === 0` and not loading */
  emptyMessage?: string;
  /** Optional primary action (wire to a modal or `/admin/.../new` later) */
  onScheduleNew?: () => void;
  scheduleLabel?: string;
};

function formatConductedAt(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function facilitatorLabel(f: ToolboxTalkListItem["facilitator"]): string | null {
  if (!f) return null;
  const name = `${f.firstName} ${f.lastName}`.trim();
  return name || null;
}

export default function ToolboxTalksPanel({
  siteName,
  talks,
  loading = false,
  error = null,
  emptyMessage = "No toolbox talks logged for this site yet.",
  onScheduleNew,
  scheduleLabel = "Log toolbox talk",
}: ToolboxTalksPanelProps) {
  const sorted = useMemo(
    () =>
      [...talks].sort(
        (a, b) =>
          new Date(b.conductedAt).getTime() -
          new Date(a.conductedAt).getTime()
      ),
    [talks]
  );

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
      aria-labelledby="toolbox-talks-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="toolbox-talks-heading"
            className="text-xl font-semibold text-gray-900"
          >
            Toolbox talks
          </h2>
          {siteName ? (
            <p className="mt-1 text-sm text-gray-600">{siteName}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-600">
              Site safety briefings and attendance notes.
            </p>
          )}
        </div>
        {onScheduleNew ? (
          <button
            type="button"
            onClick={onScheduleNew}
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {scheduleLabel}
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">Loading toolbox talks…</p>
      ) : sorted.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
          {sorted.map((talk) => {
            const who = facilitatorLabel(talk.facilitator);
            return (
              <li key={talk.id} className="py-4 first:pt-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900">{talk.title}</h3>
                    {talk.topic ? (
                      <p className="mt-0.5 text-sm text-gray-600">
                        {talk.topic}
                      </p>
                    ) : null}
                  </div>
                  <time
                    className="shrink-0 text-sm tabular-nums text-gray-500 sm:text-right"
                    dateTime={
                      typeof talk.conductedAt === "string"
                        ? talk.conductedAt
                        : talk.conductedAt.toISOString()
                    }
                  >
                    {formatConductedAt(talk.conductedAt)}
                  </time>
                </div>
                {who ? (
                  <p className="mt-2 text-sm text-gray-600">
                    Facilitator:{" "}
                    <span className="font-medium text-gray-800">{who}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm italic text-gray-400">
                    No facilitator recorded.
                  </p>
                )}
                {talk.notes ? (
                  <p className="mt-2 whitespace-pre-wrap border-l-2 border-blue-100 pl-3 text-sm text-gray-700">
                    {talk.notes}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
