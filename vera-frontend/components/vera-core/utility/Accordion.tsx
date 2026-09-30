"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
};

export function Accordion({ items, defaultOpenId, className }: AccordionProps) {
  const [openId, setOpenId] = React.useState<string | null>(defaultOpenId ?? null);

  return (
    <section className={cn("divide-y divide-[var(--border)] rounded-[var(--radius-md)] border border-[var(--border)]", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <section key={item.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              {item.title}
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </button>
            {open ? (
              <section className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                {item.content}
              </section>
            ) : null}
          </section>
        );
      })}
    </section>
  );
}
