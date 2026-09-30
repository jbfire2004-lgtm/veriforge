"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchSelectorAvailability } from "@/lib/hub/industry-safety/api";
import type {
  CompanySubtype,
  EntityType,
  IndustryCode,
  IndustrySelectorState,
  ProjectSubtype,
  ScaleBand,
  SelectorAvailabilityResponse,
} from "@/lib/hub/industry-safety/types";
import {
  COMPANY_SUBTYPES,
  PROJECT_SUBTYPES,
  SCALES,
} from "@/lib/hub/industry-safety/types";

export const DEFAULT_INDUSTRY_SELECTOR: IndustrySelectorState = {
  industry: "energy",
  entityType: "project",
  subtype: "transmission",
  scale: "large",
  period: "2026-Q2",
};

function defaultSubtype(entityType: EntityType): ProjectSubtype | CompanySubtype {
  return entityType === "project" ? "transmission" : "utility";
}

function pickAvailableSubtype(
  availability: SelectorAvailabilityResponse | null,
  preferred: string,
  entityType: EntityType,
): ProjectSubtype | CompanySubtype {
  const list = availability?.subtypes.filter((s) => s.available) ?? [];
  if (list.some((s) => s.id === preferred)) {
    return preferred as ProjectSubtype | CompanySubtype;
  }
  if (list[0]) return list[0].id as ProjectSubtype | CompanySubtype;
  return defaultSubtype(entityType);
}

function pickAvailableScale(
  availability: SelectorAvailabilityResponse | null,
  subtype: string,
  preferred: ScaleBand,
): ScaleBand {
  const st = availability?.subtypes.find((s) => s.id === subtype);
  const scales = st?.scales.filter((s) => s.available) ?? [];
  if (scales.some((s) => s.scale === preferred)) return preferred;
  if (scales[0]) return scales[0].scale;
  const global = availability?.scales.filter((s) => s.available) ?? [];
  if (global.some((s) => s.id === preferred)) return preferred;
  return global[0]?.id ?? "large";
}

function pickAvailableIndustry(
  availability: SelectorAvailabilityResponse | null,
  preferred: IndustryCode,
): IndustryCode {
  const list = availability?.industries.filter((i) => i.available) ?? [];
  if (list.some((i) => i.id === preferred)) return preferred;
  return (list[0]?.id as IndustryCode) ?? preferred;
}

export type PlaneSwitchWarning = {
  from: EntityType;
  to: EntityType;
  message: string;
} | null;

export function useIndustrySelectorSystem(
  initial: IndustrySelectorState = DEFAULT_INDUSTRY_SELECTOR,
) {
  const [state, setState] = useState<IndustrySelectorState>(initial);
  const [availability, setAvailability] =
    useState<SelectorAvailabilityResponse | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [planeWarning, setPlaneWarning] = useState<PlaneSwitchWarning>(null);
  const [pendingEntityType, setPendingEntityType] = useState<EntityType | null>(
    null,
  );
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setLoadingAvailability(true);
    void fetchSelectorAvailability({
      entityType: state.entityType,
      industry: state.industry,
      period: state.period,
    })
      .then((res) => {
        if (id !== requestId.current) return;
        setAvailability(res);
        setState((prev) => {
          const industry = pickAvailableIndustry(res, prev.industry);
          // If industry snapped, keep it; subtypes are for the requested industry in res
          const subtype = pickAvailableSubtype(res, prev.subtype, prev.entityType);
          const scale = pickAvailableScale(res, subtype, prev.scale);
          if (
            industry === prev.industry &&
            subtype === prev.subtype &&
            scale === prev.scale
          ) {
            return prev;
          }
          return { ...prev, industry, subtype, scale };
        });
      })
      .finally(() => {
        if (id === requestId.current) setLoadingAvailability(false);
      });
  }, [state.entityType, state.industry, state.period]);

  const requestEntityTypeChange = useCallback(
    (to: EntityType) => {
      if (to === state.entityType) return;
      setPendingEntityType(to);
      setPlaneWarning({
        from: state.entityType,
        to,
        message:
          to === "company"
            ? "Switching to Company view clears project filters and loads company-only benchmarks. Project data will not be mixed into company metrics."
            : "Switching to Project view clears company filters and loads project-only benchmarks. Company data will not be mixed into project metrics.",
      });
    },
    [state.entityType],
  );

  const confirmEntityTypeChange = useCallback(() => {
    if (!pendingEntityType) return;
    const to = pendingEntityType;
    setPlaneWarning(null);
    setPendingEntityType(null);
    setState((prev) => ({
      ...prev,
      entityType: to,
      subtype: defaultSubtype(to),
    }));
  }, [pendingEntityType]);

  const cancelEntityTypeChange = useCallback(() => {
    setPlaneWarning(null);
    setPendingEntityType(null);
  }, []);

  const patch = useCallback(
    (partial: Partial<IndustrySelectorState>) => {
      if (partial.entityType && partial.entityType !== state.entityType) {
        requestEntityTypeChange(partial.entityType);
        return;
      }
      setState((prev) => {
        const next = { ...prev, ...partial };
        if (next.entityType === "project") {
          if (!PROJECT_SUBTYPES.includes(next.subtype as ProjectSubtype)) {
            next.subtype = "transmission";
          }
        } else if (!COMPANY_SUBTYPES.includes(next.subtype as CompanySubtype)) {
          next.subtype = "utility";
        }
        if (!SCALES.includes(next.scale)) next.scale = "large";
        return next;
      });
    },
    [requestEntityTypeChange, state.entityType],
  );

  const availableIndustries = useMemo(
    () =>
      (availability?.industries ?? []).filter((i) => i.available).map((i) => i.id),
    [availability],
  );

  const availableSubtypes = useMemo(
    () =>
      (availability?.subtypes ?? []).filter((s) => s.available).map((s) => s.id),
    [availability],
  );

  const availableScales = useMemo(() => {
    const st = availability?.subtypes.find((s) => s.id === state.subtype);
    if (st) {
      return st.scales.filter((s) => s.available).map((s) => s.scale);
    }
    return (availability?.scales ?? [])
      .filter((s) => s.available)
      .map((s) => s.id);
  }, [availability, state.subtype]);

  const sampleForCurrent = useMemo(() => {
    const st = availability?.subtypes.find((s) => s.id === state.subtype);
    const sc = st?.scales.find((s) => s.scale === state.scale);
    return sc?.available ? sc.entityCount : null;
  }, [availability, state.subtype, state.scale]);

  const projectSelectors = useMemo(
    () =>
      state.entityType === "project"
        ? {
            industry: state.industry,
            projectType: state.subtype as ProjectSubtype,
            scale: state.scale,
            period: state.period,
          }
        : null,
    [state],
  );

  const companySelectors = useMemo(
    () =>
      state.entityType === "company"
        ? {
            industry: state.industry,
            companyType: state.subtype as CompanySubtype,
            scale: state.scale,
            period: state.period,
          }
        : null,
    [state],
  );

  return {
    state,
    patch,
    availability,
    loadingAvailability,
    availableIndustries,
    availableSubtypes,
    availableScales,
    sampleForCurrent,
    planeWarning,
    pendingEntityType,
    confirmEntityTypeChange,
    cancelEntityTypeChange,
    requestEntityTypeChange,
    projectSelectors,
    companySelectors,
  };
}
