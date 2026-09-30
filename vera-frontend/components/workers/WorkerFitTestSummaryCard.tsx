"use client";



import { HardHat } from "lucide-react";

import { formatFitTestDate } from "@/lib/fit-tests";



type FitTestReadiness = {

  pass: boolean;

  statusLabel: string;

  result?: string;

  performedAt?: string;

  expiresAt: string | null;

  /** @deprecated use expiresAt */

  nextDueAt?: string | null;

  expired?: boolean;

  expiringSoon?: boolean;

};



type Props = {

  workerId: number;

  fitTest: FitTestReadiness | null | undefined;

  /** When set, renders children instead of linking away for full panel actions. */

  children?: ReactNode;

};



export function WorkerFitTestSummaryCard({ workerId, fitTest, children }: Props) {

  const expiry = fitTest?.expiresAt ?? fitTest?.nextDueAt ?? null;

  const statusTone = !fitTest

    ? "text-slate-600"

    : fitTest.pass

      ? fitTest.expiringSoon

        ? "text-amber-800"

        : "text-teal-800"

      : "text-red-800";



  return (

    <section

      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"

      data-testid="worker-fit-test-summary"

    >

      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900">

        <HardHat className="h-5 w-5 text-teal-600" aria-hidden />

        Respirator fit test

      </h2>

      {!fitTest ? (

        <p className="text-sm text-slate-500">No fit test on file.</p>

      ) : (

        <p className={`text-sm ${statusTone}`}>

          Status: <strong>{fitTest.statusLabel}</strong>

          {fitTest.result ? (

            <>

              {" "}

              · Result {fitTest.result}

            </>

          ) : null}

          {expiry ? (

            <>

              {" "}

              · Expires {formatFitTestDate(expiry)}

            </>

          ) : null}

          {fitTest.expiringSoon ? (

            <span className="ml-1 text-xs font-medium">(due within 30 days)</span>

          ) : null}

        </p>

      )}

      {children ?? (

        <p className="mt-3 text-xs text-slate-500">Worker {workerId}</p>

      )}

    </section>

  );

}


