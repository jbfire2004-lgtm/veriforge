"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchLessonLearned } from "@/lib/safety-intelligence";
import { SfCard, SfSection } from "@/src/components/safety-forms/ui";

export default function LessonDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [lesson, setLesson] = useState<Awaited<ReturnType<typeof fetchLessonLearned>> | null>(null);

  useEffect(() => {
    if (id) void fetchLessonLearned(id).then(setLesson);
  }, [id]);

  if (!lesson) {
    return <div className="p-8 text-sm">Loading…</div>;
  }

  const insights = lesson.aiInsights as {
    keyTakeaways?: string[];
  } | null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">{lesson.title}</h1>
        <p className="text-sm text-[var(--sf-text-muted)]">
          {lesson.project?.name} · {new Date(lesson.publishedAt).toLocaleDateString()}
        </p>
      </header>

      <SfCard className="space-y-4 p-6">
        <SfSection title="Summary">
          <p className="text-sm leading-relaxed text-[var(--sf-text)]">{lesson.summary}</p>
        </SfSection>
        {lesson.rootCause && (
          <SfSection title="Root cause">
            <p className="text-sm">{lesson.rootCause}</p>
          </SfSection>
        )}
        {lesson.correctiveAction && (
          <SfSection title="Corrective action">
            <p className="text-sm">{lesson.correctiveAction}</p>
          </SfSection>
        )}
      </SfCard>

      {insights?.keyTakeaways?.length ? (
        <SfCard className="p-6">
          <h2 className="font-medium">Key takeaways</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {insights.keyTakeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </SfCard>
      ) : null}

      {lesson.cail && (
        <Link
          href={`/pm/safety-intelligence/${lesson.cail.id}`}
          className="text-sm text-[var(--sf-primary)]"
        >
          View source CAIL entry →
        </Link>
      )}
    </div>
  );
}
