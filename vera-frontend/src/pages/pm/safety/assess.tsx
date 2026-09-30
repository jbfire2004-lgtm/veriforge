"use client";

import Link from "next/link";
import { PmSafetyAssessmentForm } from "@/src/components/pm/PmSafetyAssessmentForm";

export default function PmSafetyAssessmentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          PM safety assessment
        </h1>
        <p className="text-sm text-slate-600">
          Structured <strong>JHA</strong>, <strong>FLHA</strong>,{" "}
          <strong>SIF</strong>, <strong>HECA</strong>, <strong>Energy Wheel</strong>
          , and <strong>Inspection</strong> forms with hazard/control catalogs,
          dynamic sections, and signature capture. Creates a{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            PmSafetyWorkflow
          </code>{" "}
          and navigates to the review screen. Set actor headers on the review page
          to complete worker sign-off if needed.{" "}
          <Link
            href="/pm/safety/new"
            className="font-medium text-blue-700 underline"
          >
            Simple create form
          </Link>
        </p>
      </header>
      <PmSafetyAssessmentForm />
    </div>
  );
}

