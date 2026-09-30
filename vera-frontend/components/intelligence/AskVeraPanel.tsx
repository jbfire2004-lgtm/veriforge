"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { useAskVera } from "@/lib/intelligence";

type Props = {
  companyId?: number;
  className?: string;
};

export function AskVeraPanel({ companyId, className }: Props) {
  const [input, setInput] = useState("");
  const { answer, loading, ask } = useAskVera(companyId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await ask(input.trim());
  }

  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--vera-border)",
        borderRadius: "var(--vera-radius-lg)",
        background: "var(--vera-surface)",
        padding: "var(--vera-space-4)",
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5" style={{ color: "var(--vera-accent)" }} />
        <h3 className="text-sm font-semibold" style={{ color: "var(--vera-text)" }}>
          Ask Vera
        </h3>
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask Vera: "What is our compliance status?"'
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: "var(--vera-border)",
            background: "var(--vera-surface-elevated)",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white"
          style={{ background: "var(--vera-accent)" }}
        >
          <Send className="h-4 w-4" />
          Ask
        </button>
      </form>
      {answer && (
        <div
          className="mt-4 rounded-md p-3 text-sm"
          style={{
            background: "var(--vera-surface-elevated)",
            color: "var(--vera-text-muted)",
          }}
        >
          <p style={{ color: "var(--vera-text)" }}>{answer.answer}</p>
          {answer.followUps && answer.followUps.length > 0 && (
            <ul className="mt-2 list-disc pl-4">
              {answer.followUps.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
