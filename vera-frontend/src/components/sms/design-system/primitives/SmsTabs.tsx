"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("SmsTabs components must be used within SmsTabs");
  return ctx;
}

type SmsTabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

/** Mobile-first tab container — scrollable tab list on narrow screens. */
export function SmsTabs({ value, onValueChange, children, className }: SmsTabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={sfCn("space-y-[var(--sms-space-6)]", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function SmsTabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={sfCn(
        "flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SmsTabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: active, onValueChange } = useTabsContext();
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => onValueChange(value)}
      className={sfCn(
        "shrink-0 rounded-[var(--sf-radius-md)] px-3 py-2 text-sm font-medium transition-colors",
        selected
          ? "bg-[var(--sf-primary)] text-white shadow-[var(--sf-shadow-sm)]"
          : "bg-[var(--sf-surface)] text-[var(--sf-text-muted)] hover:bg-[var(--sf-surface-hover)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SmsTabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;

  return (
    <div role="tabpanel" className={sfCn("sf-animate-in", className)}>
      {children}
    </div>
  );
}
