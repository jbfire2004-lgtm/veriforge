"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeedbackRequest } from "@vera/api-contract";
import { listFeedback, submitFeedback, voteFeedback } from "@/lib/adoption/api";
import { Button, Card, CardContent, Input, Label, Select, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/src/lib/utils";

const CATEGORIES = [
  "general",
  "training",
  "verification",
  "pm",
  "equipment",
  "incidents",
  "mobile",
  "integrations",
] as const;

const STATUS_LABELS: Record<string, string> = {
  NEW: "Submitted",
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  DECLINED: "Declined",
};

export function FeedbackBoard() {
  const { toast } = useToast();
  const [items, setItems] = useState<FeedbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    void listFeedback({
      category: category || undefined,
      sort: "upvotes",
    })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitFeedback({ title, description, category: formCategory });
      setTitle("");
      setDescription("");
      toast({ title: "Thanks!", description: "Your idea was submitted." });
      load();
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Try again",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(id: number) {
    try {
      await voteFeedback(id);
      load();
    } catch {
      toast({ title: "Already voted or unavailable", variant: "destructive" });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F8F8C]">
          Product feedback
        </p>
        <h1 className="text-3xl font-bold text-[#2A2E33]">Ideas & suggestions</h1>
        <p className="text-sm text-[#5a6b7c]">
          Submit feature requests, upvote ideas from your team, and track status.
        </p>
      </header>

      <Card className="border-[#2A2E33]/10">
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fb-title">Title</Label>
              <Input
                id="fb-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-desc">Description</Label>
              <Textarea
                id="fb-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-cat">Category</Label>
              <Select
                id="fb-cat"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit idea"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Label htmlFor="filter-cat" className="sr-only">
          Filter category
        </Label>
        <Select
          id="filter-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="max-w-xs"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <ul className="space-y-3">
        {loading ? (
          <li className="text-sm text-[#64748b]">Loading…</li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <Card className="border-[#2A2E33]/10">
                <CardContent className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => void handleVote(item.id)}
                    className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[#2F8F8C]/25 bg-[#E4F3F2] text-[#2F8F8C] transition hover:bg-[#E4F3F2]"
                    aria-label={`Upvote ${item.title}`}
                  >
                    <span className="text-lg font-bold">▲</span>
                    <span className="text-xs font-semibold">{item.upvotes}</span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#2A2E33]">{item.title}</h2>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          item.status === "COMPLETED"
                            ? "bg-[#E4F3F2] text-[#2F8F8C]"
                            : item.status === "DECLINED"
                              ? "bg-red-50 text-red-700"
                              : "bg-[#f1f5f9] text-[#64748b]",
                        )}
                      >
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#5a6b7c]">{item.description}</p>
                    <p className="mt-2 text-xs text-[#94a3b8]">{item.category}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))
        )}
        {!loading && items.length === 0 ? (
          <li className="text-center text-sm text-[#64748b]">No ideas yet — be the first.</li>
        ) : null}
      </ul>
    </div>
  );
}
