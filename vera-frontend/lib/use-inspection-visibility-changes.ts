"use client";

import { useEffect, useRef, useState } from "react";
import {
  diffInspectionVisibilityChanges,
  type InspectionVisibilityChange,
} from "./inspection-visible-items";
import type { PmInspectionTemplate } from "./pm-inspections";

type Item = PmInspectionTemplate["items"][number];

export type InspectionVisibilityNotice = InspectionVisibilityChange & {
  revealedIds: Set<string>;
};

/**
 * Tracks which checklist items just appeared or disappeared when answers change.
 * Revealed ids are cleared after a short highlight window.
 */
export function useInspectionVisibilityChanges(
  items: Item[],
  answers: Record<string, unknown>,
  highlightMs = 2400,
): InspectionVisibilityNotice | null {
  const prevAnswersRef = useRef<Record<string, unknown>>(answers);
  const initializedRef = useRef(false);
  const [notice, setNotice] = useState<InspectionVisibilityNotice | null>(null);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevAnswersRef.current = answers;
      return;
    }

    const change = diffInspectionVisibilityChanges(
      items,
      prevAnswersRef.current,
      answers,
    );
    prevAnswersRef.current = answers;

    if (!change.appeared.length && !change.hidden.length) {
      return;
    }

    setNotice({
      ...change,
      revealedIds: new Set(change.appeared.map((item) => item.id)),
    });

    const timer = window.setTimeout(() => {
      setNotice((current) =>
        current
          ? { ...current, revealedIds: new Set<string>() }
          : current,
      );
    }, highlightMs);

    const clearTimer = window.setTimeout(() => {
      setNotice(null);
    }, highlightMs + 600);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clearTimer);
    };
  }, [answers, items, highlightMs]);

  return notice;
}
