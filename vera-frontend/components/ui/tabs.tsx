"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Tabs>`);
  }
  return ctx;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : inner;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInner(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex h-11 max-w-full items-center justify-start gap-vera-2 overflow-x-auto rounded-xl border border-vera-charcoal/10 bg-vera-surface p-vera-2 shadow-sm",
        "sm:inline-flex sm:max-w-none sm:overflow-visible",
        "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    />
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  className,
  value,
  ...props
}: TabsTriggerProps) {
  const { value: active, setValue } = useTabsContext("TabsTrigger");
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      data-state={selected ? "active" : "inactive"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-vera-3 py-vera-2 text-sm font-medium tracking-tight transition-colors sm:px-vera-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vera-teal focus-visible:ring-offset-2",
        selected
          ? "bg-vera-white text-vera-deep shadow-md"
          : "text-vera-muted hover:bg-vera-white/70 hover:text-vera-charcoal",
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    />
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  className,
  value,
  ...props
}: TabsContentProps) {
  const { value: active } = useTabsContext("TabsContent");
  if (active !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-vera-4 rounded-xl border border-vera-charcoal/10 bg-vera-white p-vera-4 text-sm leading-relaxed text-vera-charcoal shadow-md outline-none sm:mt-vera-6 sm:p-vera-6",
        className
      )}
      {...props}
    />
  );
}
