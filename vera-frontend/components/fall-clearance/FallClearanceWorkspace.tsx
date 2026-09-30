"use client";

import { useEffect, useState } from "react";
import { calculateFallClearance, listFallEquipment } from "./api";
import { AIExplanationPanel } from "./AIExplanationPanel";
import { ClearanceBreakdownTable } from "./ClearanceBreakdownTable";
import { ClearanceVisualization } from "./ClearanceVisualization";
import { EquipmentSelector } from "./EquipmentSelector";
import { GeometryForm } from "./GeometryForm";
import { IntegrationButtons } from "./IntegrationButtons";
import type {
  CalculationResult,
  ConfigurationInstance,
  EquipmentProfile,
} from "./types";

export function FallClearanceWorkspace({
  initialConfig,
  onAttachToPlan,
  onAttachToRescue,
  onAttachToERP,
}: {
  initialConfig?: Partial<ConfigurationInstance>;
  onAttachToPlan?: (result: CalculationResult) => void;
  onAttachToRescue?: (result: CalculationResult) => void;
  onAttachToERP?: (result: CalculationResult) => void;
}) {
  const [equipmentList, setEquipmentList] = useState<EquipmentProfile[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [config, setConfig] = useState<ConfigurationInstance>({
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : undefined,
    siteId: initialConfig?.siteId || undefined,
    projectId: initialConfig?.projectId || undefined,
    workerMassKg: initialConfig?.workerMassKg ?? 90,
    anchorHeightM: initialConfig?.anchorHeightM ?? 6,
    workSurfaceHeightM: initialConfig?.workSurfaceHeightM ?? 3,
    horizontalOffsetM: initialConfig?.horizontalOffsetM ?? 1.5,
    equipmentId: initialConfig?.equipmentId || "",
    environment: (initialConfig?.environment || "outdoor").toLowerCase(),
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listFallEquipment()
      .then((list) => {
        if (!cancelled) {
          setEquipmentList(list);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load equipment",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config.equipmentId) {
      setResult(null);
      return;
    }
    setLoading(true);
    setCalcError(null);
    const timeout = setTimeout(() => {
      calculateFallClearance(config)
        .then((data) => setResult(data))
        .catch((err: unknown) => {
          setResult(null);
          setCalcError(
            err instanceof Error ? err.message : "Calculation failed",
          );
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [config]);

  return (
    <div className="grid h-full gap-4 lg:grid-cols-3">
      <div className="space-y-4 border-[var(--border)] lg:border-r lg:pr-4">
        <EquipmentSelector
          equipmentList={equipmentList}
          selectedId={config.equipmentId}
          onSelect={(id) => setConfig((c) => ({ ...c, equipmentId: id }))}
        />
        {loadError ? (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {loadError}
          </p>
        ) : null}
        <GeometryForm
          value={config}
          onChange={(partial) => setConfig((c) => ({ ...c, ...partial }))}
        />
      </div>

      <div className="flex flex-col items-stretch">
        <ClearanceVisualization
          requiredClearanceM={result?.requiredClearanceM ?? 0}
          availableClearanceM={result?.availableClearanceM ?? 0}
          status={result?.status ?? "PASS"}
          loading={loading}
        />
        <ClearanceBreakdownTable breakdown={result?.breakdown ?? null} />
        {calcError ? (
          <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
            {calcError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col justify-between gap-4">
        <AIExplanationPanel
          status={result?.status ?? "PASS"}
          aiExplanation={result?.aiExplanation ?? ""}
          standardBasis={result?.standardBasis ?? []}
        />
        <IntegrationButtons
          disabled={!result || result.status === "FAIL"}
          onAttachToPlan={() => result && onAttachToPlan?.(result)}
          onAttachToRescue={() => result && onAttachToRescue?.(result)}
          onAttachToERP={() => result && onAttachToERP?.(result)}
        />
      </div>
    </div>
  );
}
