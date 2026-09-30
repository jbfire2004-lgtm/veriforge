"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  Loader2,
  Pencil,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import {
  aiGenerateFromFile,
  aiGenerateFromText,
  aiGenerateQuiz,
  aiImproveBlock,
  createOrientationDefinition,
  updateOrientationDefinition,
  uploadOrientationDefinition,
} from "@/lib/orientation/veriforge-api";
import { useOrientationDefinition } from "@/lib/orientation/veriforge-queries";
import {
  parseContentBlocks,
  type OrientationContentBlock,
  type OrientationContentMode,
  type OrientationDefinitionType,
} from "@/lib/orientation/veriforge-types";
import { DefinitionStatusBadge } from "./OrientationStatusBadges";

type Props = {
  companyId: number;
  orientationId?: string;
  mode: OrientationContentMode;
  basePath: string;
};

type AiPreview = {
  title?: string;
  contentBlocks?: OrientationContentBlock[];
  contentBlock?: OrientationContentBlock;
  label: string;
};

function newBlock(
  type: OrientationContentBlock["type"],
  order: number,
): OrientationContentBlock {
  return {
    id: crypto.randomUUID(),
    type,
    title:
      type === "quiz"
        ? "Quiz"
        : type === "policy_ack"
          ? "Acknowledgement"
          : "Section",
    body: "",
    order,
    ...(type === "quiz"
      ? {
          quiz: {
            prompt: "What should you do first when you see a hazard?",
            choices: [
              "Stop work and notify your supervisor",
              "Ignore it",
              "Continue working",
              "Ask a coworker quietly",
            ],
            answerIndex: 0,
          },
        }
      : {}),
  };
}

export function OrientationEditor({
  companyId,
  orientationId,
  mode: initialMode,
  basePath,
}: Props) {
  const router = useRouter();
  const existing = useOrientationDefinition(orientationId);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("New orientation");
  const [type, setType] = useState<OrientationDefinitionType>("company");
  const [mode, setMode] = useState<OrientationContentMode>(initialMode);
  const [isPublished, setIsPublished] = useState(false);
  const [version, setVersion] = useState("1.0.0");
  const [blocks, setBlocks] = useState<OrientationContentBlock[]>([
    newBlock("text", 0),
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiPreview, setAiPreview] = useState<AiPreview | null>(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    if (!existing.data) return;
    setTitle(existing.data.title);
    setType(existing.data.type);
    setMode(existing.data.contentMode);
    setIsPublished(existing.data.isPublished);
    setVersion(existing.data.version);
    const parsed = parseContentBlocks(existing.data.contentBlocks);
    setBlocks(parsed.length ? parsed : [newBlock("text", 0)]);
    setSelectedId(parsed[0]?.id ?? null);
  }, [existing.data]);

  const selected = useMemo(
    () => blocks.find((b) => b.id === selectedId) ?? blocks[0],
    [blocks, selectedId],
  );

  const wasPublishedOnLoad = Boolean(existing.data?.isPublished);

  function updateBlock(id: string, patch: Partial<OrientationContentBlock>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  }

  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === fromId);
      const to = prev.findIndex((b) => b.id === toId);
      if (from < 0 || to < 0) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved!);
      return copy.map((b, i) => ({ ...b, order: i }));
    });
  }

  function persist(opts: { publish?: boolean; bumpVersion?: boolean }) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const nextPublished = opts.publish ? true : isPublished;
        const payload = {
          title,
          type,
          contentMode: mode,
          contentBlocks: blocks.map((b, i) => ({ ...b, order: i })),
          isPublished: nextPublished,
          expiryRules: { durationDays: 365 },
        };
        if (orientationId) {
          const updated = await updateOrientationDefinition(orientationId, {
            ...payload,
            bumpVersion: opts.bumpVersion ?? opts.publish ?? false,
          });
          setIsPublished(updated.isPublished);
          setVersion(updated.version);
          setMessage(
            opts.publish
              ? `Published as version ${updated.version}`
              : "Draft saved",
          );
        } else {
          const created = await createOrientationDefinition({
            companyId,
            ...payload,
          });
          setMessage("Created");
          router.replace(`${basePath}/${created.id}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  async function runAiPreview(
    label: string,
    fn: () => Promise<{
      contentBlocks?: OrientationContentBlock[];
      contentBlock?: OrientationContentBlock;
      title?: string;
    }>,
  ) {
    setAiBusy(true);
    setError(null);
    try {
      const result = await fn();
      setAiPreview({
        label,
        title: result.title,
        contentBlocks: result.contentBlocks,
        contentBlock: result.contentBlock,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setAiBusy(false);
    }
  }

  function applyAiPreview() {
    if (!aiPreview) return;
    if (aiPreview.title) setTitle(aiPreview.title);
    if (aiPreview.contentBlocks?.length) {
      setBlocks(aiPreview.contentBlocks.map((b, i) => ({ ...b, order: i })));
      setSelectedId(aiPreview.contentBlocks[0]?.id ?? null);
      setMode((m) => (m === "uploaded" ? "hybrid" : m));
    }
    if (aiPreview.contentBlock && selected) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === selected.id
            ? { ...aiPreview.contentBlock!, order: b.order }
            : b,
        ),
      );
    }
    setAiPreview(null);
    setMessage("AI preview applied");
  }

  return (
    <div className="space-y-5">
      {wasPublishedOnLoad ? (
        <div
          role="status"
          className="rounded-[3px] border border-[#A8842F]/40 bg-[#C89F3D]/15 px-4 py-3 text-sm text-[#3D3210]"
        >
          You are editing a published orientation. Saving drafts is fine; use
          “Publish new version” to create a new published revision for workers.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <DefinitionStatusBadge isPublished={isPublished} />
            <span className="text-xs font-medium text-[#2A2E33]/65">
              Version {version}
            </span>
            <span className="text-xs capitalize text-[#2A2E33]/55">
              · {mode}
            </span>
          </div>
          <Label htmlFor="orient-title">Title</Label>
          <Input
            id="orient-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="orient-type" className="text-xs">
              Type
            </Label>
            <select
              id="orient-type"
              className="h-10 rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 text-sm"
              value={type}
              onChange={(e) =>
                setType(e.target.value as OrientationDefinitionType)
              }
            >
              {["company", "site", "project", "safety", "trade"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="outline"
            onClick={() => persist({ bumpVersion: false })}
            disabled={pending}
            className="gap-2"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            Save draft
          </Button>
          <Button
            onClick={() => persist({ publish: true, bumpVersion: true })}
            disabled={pending}
          >
            Publish new version
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-[#B33A3A]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-[#3D8F58]" role="status">
          {message}
        </p>
      ) : null}

      {mode === "uploaded" && !orientationId ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <Label htmlFor="orient-upload">Upload file</Label>
            <Input
              id="orient-upload"
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx,video/*,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                startTransition(async () => {
                  try {
                    const created = await uploadOrientationDefinition({
                      companyId,
                      title: title || file.name,
                      type,
                      file,
                    });
                    router.replace(`${basePath}/${created.id}`);
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Upload failed",
                    );
                  }
                });
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        <Card>
          <CardContent className="space-y-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2A2E33]/60">
                Blocks
              </p>
              <select
                aria-label="Add content block"
                className="h-8 rounded-[3px] border border-[#2A2E33]/20 px-2 text-xs"
                defaultValue=""
                onChange={(e) => {
                  const t = e.target.value as OrientationContentBlock["type"];
                  if (!t) return;
                  const b = newBlock(t, blocks.length);
                  setBlocks((prev) => [...prev, b]);
                  setSelectedId(b.id);
                  if (t === "quiz") setQuizModalOpen(true);
                  e.target.value = "";
                }}
              >
                <option value="">Add…</option>
                <option value="text">Text</option>
                <option value="slide">Slide</option>
                <option value="video">Video</option>
                <option value="quiz">Quiz</option>
                <option value="policy_ack">Policy ack</option>
              </select>
            </div>
            <ul className="space-y-1" aria-label="Content blocks">
              {blocks.map((b) => (
                <li
                  key={b.id}
                  draggable
                  onDragStart={() => {
                    dragId.current = b.id;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId.current) reorder(dragId.current, b.id);
                    dragId.current = null;
                  }}
                >
                  <div
                    className={`flex w-full items-center gap-1 rounded-[3px] px-1 py-1.5 text-sm ${
                      selected?.id === b.id
                        ? "bg-[#2F8F8C]/15 text-[#1A5553]"
                        : "hover:bg-[#F4F6F8]"
                    }`}
                  >
                    <span
                      className="cursor-grab touch-none px-1 text-[#2A2E33]/40"
                      aria-hidden
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left"
                      onClick={() => {
                        setSelectedId(b.id);
                        if (b.type === "quiz") setQuizModalOpen(true);
                      }}
                    >
                      <span className="capitalize text-[#2A2E33]/55">
                        {b.type}
                      </span>
                      : {b.title || "Untitled"}
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-[#2A2E33]/50 hover:bg-white hover:text-[#B33A3A]"
                      aria-label={`Delete ${b.title || b.type}`}
                      onClick={() => {
                        setBlocks((prev) =>
                          prev
                            .filter((x) => x.id !== b.id)
                            .map((x, i) => ({ ...x, order: i })),
                        );
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2A2E33]/60">
              Block editor
            </p>
            {selected ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Input
                    value={selected.title ?? ""}
                    onChange={(e) =>
                      updateBlock(selected.id, { title: e.target.value })
                    }
                    placeholder="Block title"
                    aria-label="Block title"
                  />
                  {selected.type === "quiz" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setQuizModalOpen(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Edit quiz
                    </Button>
                  ) : null}
                </div>

                {selected.type === "video" ? (
                  <Input
                    value={selected.mediaUrl ?? ""}
                    onChange={(e) =>
                      updateBlock(selected.id, { mediaUrl: e.target.value })
                    }
                    placeholder="Video URL"
                    aria-label="Video URL"
                  />
                ) : null}

                {selected.type === "quiz" && selected.quiz ? (
                  <button
                    type="button"
                    onClick={() => setQuizModalOpen(true)}
                    className="w-full rounded-[3px] border border-dashed border-[#2A2E33]/25 bg-[#F7F8F9] p-4 text-left hover:border-[#2F8F8C]/50"
                  >
                    <p className="text-sm font-medium">{selected.quiz.prompt}</p>
                    <p className="mt-1 text-xs text-[#2A2E33]/60">
                      {selected.quiz.choices.length} choices · click to edit in
                      modal
                    </p>
                  </button>
                ) : selected.type !== "video" ? (
                  <Textarea
                    rows={12}
                    value={selected.body ?? ""}
                    onChange={(e) =>
                      updateBlock(selected.id, { body: e.target.value })
                    }
                    placeholder="Write content… (inline edit)"
                    aria-label="Block body"
                  />
                ) : null}

                <div
                  className="rounded-[3px] border border-[#2A2E33]/10 bg-[#F7F8F9] p-4"
                  aria-live="polite"
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#2A2E33]/50">
                    Preview
                  </p>
                  <h3 className="text-lg font-semibold">
                    {selected.title || "Untitled"}
                  </h3>
                  {selected.type === "video" && selected.mediaUrl ? (
                    <video
                      className="mt-3 max-h-64 w-full"
                      controls
                      src={selected.mediaUrl}
                    />
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#2A2E33]/80">
                      {selected.body || selected.quiz?.prompt || "—"}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#2A2E33]/60">Select a block</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2A2E33]/60">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI panel
            </p>
            <Label htmlFor="ai-source" className="text-xs">
              Description or source text
            </Label>
            <Textarea
              id="ai-source"
              rows={4}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Describe the orientation or paste source text…"
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={aiBusy || !aiText.trim()}
                onClick={() =>
                  void runAiPreview("Generate from description", () =>
                    aiGenerateFromText({
                      companyId,
                      title,
                      text: aiText,
                      type,
                    }),
                  )
                }
              >
                Generate from description
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={aiBusy || !aiText.trim()}
                className="gap-2"
                onClick={() =>
                  void runAiPreview("Convert uploaded file", () =>
                    aiGenerateFromFile({
                      companyId,
                      title,
                      fileName: "pasted-source.txt",
                      textExtract: aiText,
                    }),
                  )
                }
              >
                <Upload className="h-3.5 w-3.5" aria-hidden />
                Convert uploaded file
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={aiBusy}
                onClick={() =>
                  void runAiPreview("Generate quiz", async () => {
                    const quiz = await aiGenerateQuiz({
                      companyId,
                      topic: title || "site safety",
                      contentBlocks: blocks,
                      questionCount: 3,
                    });
                    return {
                      contentBlocks: [
                        ...blocks.filter((b) => b.type !== "quiz"),
                        ...quiz.contentBlocks,
                      ],
                    };
                  })
                }
              >
                Generate quiz
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={aiBusy || !selected}
                onClick={() =>
                  void runAiPreview("Improve selected block", () =>
                    aiImproveBlock({
                      companyId,
                      block: selected!,
                      instruction:
                        aiText || "Improve clarity for field workers",
                    }),
                  )
                }
              >
                Improve selected block
              </Button>
            </div>
            {aiBusy ? (
              <p className="flex items-center gap-2 text-xs text-[#2A2E33]/65">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Generating preview…
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={quizModalOpen && selected?.type === "quiz"}
        onOpenChange={setQuizModalOpen}
        title="Edit quiz block"
        description="One question with multiple choices. Mark the correct answer."
        className="max-w-xl"
        footer={
          <Button type="button" onClick={() => setQuizModalOpen(false)}>
            Done
          </Button>
        }
      >
        {selected?.type === "quiz" && selected.quiz ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="quiz-prompt">Question</Label>
              <Textarea
                id="quiz-prompt"
                rows={3}
                value={selected.quiz.prompt}
                onChange={(e) =>
                  updateBlock(selected.id, {
                    quiz: { ...selected.quiz!, prompt: e.target.value },
                  })
                }
              />
            </div>
            {selected.quiz.choices.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="quiz-answer"
                  checked={selected.quiz!.answerIndex === i}
                  onChange={() =>
                    updateBlock(selected.id, {
                      quiz: { ...selected.quiz!, answerIndex: i },
                    })
                  }
                  aria-label={`Mark choice ${i + 1} as correct`}
                />
                <Input
                  value={c}
                  onChange={(e) => {
                    const choices = [...selected.quiz!.choices];
                    choices[i] = e.target.value;
                    updateBlock(selected.id, {
                      quiz: { ...selected.quiz!, choices },
                    });
                  }}
                  aria-label={`Choice ${i + 1}`}
                />
              </div>
            ))}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!aiPreview}
        onOpenChange={(open) => {
          if (!open) setAiPreview(null);
        }}
        title="AI preview"
        description={
          aiPreview
            ? `Review “${aiPreview.label}” before applying to the editor.`
            : undefined
        }
        className="max-w-2xl"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setAiPreview(null)}>
              Discard
            </Button>
            <Button onClick={applyAiPreview}>Apply to editor</Button>
          </div>
        }
      >
        {aiPreview ? (
          <div className="max-h-[50vh] space-y-3 overflow-y-auto text-sm">
            {aiPreview.title ? (
              <p>
                <span className="font-medium">Title:</span> {aiPreview.title}
              </p>
            ) : null}
            {aiPreview.contentBlock ? (
              <div className="rounded-[3px] border border-[#2A2E33]/10 bg-[#F7F8F9] p-3">
                <p className="font-medium">
                  {aiPreview.contentBlock.title || aiPreview.contentBlock.type}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[#2A2E33]/80">
                  {aiPreview.contentBlock.body ||
                    aiPreview.contentBlock.quiz?.prompt}
                </p>
              </div>
            ) : null}
            {aiPreview.contentBlocks?.map((b) => (
              <div
                key={b.id}
                className="rounded-[3px] border border-[#2A2E33]/10 bg-[#F7F8F9] p-3"
              >
                <p className="text-xs uppercase tracking-wide text-[#2A2E33]/50">
                  {b.type}
                </p>
                <p className="font-medium">{b.title || "Untitled"}</p>
                <p className="mt-1 whitespace-pre-wrap text-[#2A2E33]/80">
                  {(b.body || b.quiz?.prompt || "").slice(0, 280)}
                  {(b.body || b.quiz?.prompt || "").length > 280 ? "…" : ""}
                </p>
              </div>
            ))}
            {!aiPreview.title &&
            !aiPreview.contentBlock &&
            !aiPreview.contentBlocks?.length ? (
              <p className="text-[#2A2E33]/65">No content returned.</p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
