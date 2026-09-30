"use client";

import { VS_COLORS, VS_MOTION, VS_RADIUS } from "@/lib/verisuite-intelligence-ui/tokens";

type Bin = {
  bucket: string;
  corrective: number;
  preventive: number;
};

type Props = {
  title?: string;
  bins: Bin[];
  onBinClick?: (bin: Bin) => void;
  selectedBucket?: string | null;
};

/**
 * Action aging histogram — Corrective vs Preventive by days open.
 */
export function ActionAgingHistogram({
  title = "Action aging",
  bins,
  onBinClick,
  selectedBucket,
}: Props) {
  const max = Math.max(1, ...bins.map((b) => b.corrective + b.preventive));
  return (
    <div className="vs-panel p-4" id="vs-action-aging" style={{ borderRadius: VS_RADIUS }}>
      <p className="vs-eyebrow">{title}</p>
      <div className="mt-4 flex items-end gap-2" style={{ minHeight: 120 }}>
        {bins.map((b) => {
          const total = b.corrective + b.preventive;
          const h = (total / max) * 100;
          const cShare = total ? (b.corrective / total) * 100 : 0;
          const selected = selectedBucket === b.bucket;
          const interactive = Boolean(onBinClick);
          return (
            <button
              key={b.bucket}
              type="button"
              disabled={!interactive}
              className="flex flex-1 flex-col items-center gap-1 border-0 bg-transparent p-0"
              style={{
                cursor: interactive ? "pointer" : "default",
                opacity: selectedBucket && !selected ? 0.5 : 1,
                minHeight: 44,
                transition: `opacity ${VS_MOTION.fast} ${VS_MOTION.ease}`,
              }}
              title={`${b.bucket}: ${b.corrective} corrective · ${b.preventive} preventive`}
              onClick={() => onBinClick?.(b)}
            >
              <div
                className="flex w-full flex-col justify-end overflow-hidden"
                style={{
                  height: 96,
                  borderRadius: VS_RADIUS,
                  outline: selected ? `1px solid ${VS_COLORS.blue}` : undefined,
                }}
              >
                <div
                  className="w-full"
                  style={{
                    height: `${h}%`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    transition: `height ${VS_MOTION.normal} ${VS_MOTION.ease}`,
                  }}
                >
                  <div
                    style={{
                      height: `${100 - cShare}%`,
                      background: VS_COLORS.orange,
                      minHeight: b.preventive ? 2 : 0,
                    }}
                  />
                  <div
                    style={{
                      height: `${cShare}%`,
                      background: VS_COLORS.blue,
                      minHeight: b.corrective ? 2 : 0,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] tabular-nums vs-muted">{b.bucket}</span>
              <span className="text-[10px] tabular-nums" style={{ color: VS_COLORS.white }}>
                {total}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] uppercase tracking-wide vs-muted">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-3"
            style={{ background: VS_COLORS.blue, borderRadius: VS_RADIUS }}
          />
          Corrective Actions
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-3"
            style={{ background: VS_COLORS.orange, borderRadius: VS_RADIUS }}
          />
          Preventive Actions
        </span>
      </div>
    </div>
  );
}
