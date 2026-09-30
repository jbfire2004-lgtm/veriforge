"use client";

/**
 * Smart meeting topic cards — AI-14 suggestions + scheduled topics.
 */

import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

export type MeetingTopicCardItem = {
  id: string;
  title: string;
  rationale?: string;
  sourceModule?: string;
  confidence?: number;
  hrefCreate?: string;
  selected?: boolean;
};

type Props = {
  title?: string;
  topics: MeetingTopicCardItem[];
  onSelect?: (id: string) => void;
  onCreate?: (id: string) => void;
};

export function MeetingTopicCards({
  title = "Smart topics",
  topics,
  onSelect,
  onCreate,
}: Props) {
  return (
    <div className="vs-panel p-4">
      <p className="vs-eyebrow">{title}</p>
      <div className="mt-3 space-y-2">
        {topics.map((t) => {
          const selected = Boolean(t.selected);
          return (
            <div
              key={t.id}
              className={`vs-panel p-3 ${onSelect ? "vs-panel-interactive" : ""} ${selected ? "vs-panel-expanded" : ""}`}
              style={{ background: VS_COLORS.panel }}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => onSelect?.(t.id)}
              onKeyDown={
                onSelect
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(t.id);
                      }
                    }
                  : undefined
              }
            >
              <p className="text-sm font-semibold" style={{ color: VS_COLORS.white }}>
                {t.title}
              </p>
              {t.rationale ? (
                <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
                  {t.rationale}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {t.sourceModule ? (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: VS_COLORS.blue }}
                  >
                    {t.sourceModule}
                  </span>
                ) : null}
                {t.confidence != null ? (
                  <span className="text-[10px] uppercase" style={{ color: VS_COLORS.muted }}>
                    {Math.round(t.confidence * 100)}% conf
                  </span>
                ) : null}
                {onCreate || t.hrefCreate ? (
                  <button
                    type="button"
                    className="vs-btn vs-btn-primary ml-auto"
                    style={{ height: "1.75rem", fontSize: "0.7rem" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCreate) onCreate(t.id);
                      else if (t.hrefCreate) window.location.href = t.hrefCreate;
                    }}
                  >
                    Schedule
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {!topics.length ? (
        <p className="mt-2 text-sm" style={{ color: VS_COLORS.muted }}>
          No topics yet — generate from incidents, FLHA, or inspections.
        </p>
      ) : null}
    </div>
  );
}
