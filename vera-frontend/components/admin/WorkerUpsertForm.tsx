"use client";

import Link from "next/link";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { apiPatch, apiPost } from "@/lib/api";
import { Button, CardContent, Input, Label, Select } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export type WorkerCompanyOption = { id: number; name: string };

export type WorkerUpsertInitial = {
  id: number;
  firstName: string;
  lastName: string;
  companyId: number | null;
  photoUrl?: string | null;
};

export type WorkerUpsertFormHandle = {
  validateWorkflowStep: (step: number) => string | null;
  submit: () => void;
};

type Props = {
  mode: "create" | "edit";
  companies: WorkerCompanyOption[];
  initial?: WorkerUpsertInitial;
  cancelHref: string;
  listHref?: string;
  workflowStep?: number;
  submitButtonId?: string;
};

const MAX_LEN = 120;

function validate(firstName: string, lastName: string, photoUrl: string) {
  const errors: Record<string, string> = {};
  const fn = firstName.trim();
  const ln = lastName.trim();
  if (!fn) errors.firstName = "First name is required.";
  else if (fn.length > MAX_LEN) errors.firstName = `Keep under ${MAX_LEN} characters.`;
  if (!ln) errors.lastName = "Last name is required.";
  else if (ln.length > MAX_LEN) errors.lastName = `Keep under ${MAX_LEN} characters.`;
  const pu = photoUrl.trim();
  if (pu) {
    try {
      new URL(pu);
    } catch {
      errors.photoUrl = "Enter a valid URL or leave blank.";
    }
  }
  return errors;
}

export const WorkerUpsertForm = forwardRef<WorkerUpsertFormHandle, Props>(
  function WorkerUpsertForm(
    {
      mode,
      companies,
      initial,
      cancelHref,
      listHref = "/admin/workers",
      workflowStep,
      submitButtonId,
    },
    ref,
  ) {
    const { pending, error, setError, run } = useAdminMutation();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const defaults = useMemo(
      () => ({
        firstName: initial?.firstName ?? "",
        lastName: initial?.lastName ?? "",
        companyId: initial?.companyId != null ? String(initial.companyId) : "",
        photoUrl: initial?.photoUrl ?? "",
      }),
      [initial],
    );

    const [firstName, setFirstName] = useState(defaults.firstName);
    const [lastName, setLastName] = useState(defaults.lastName);
    const [companyId, setCompanyId] = useState(defaults.companyId);
    const [photoUrl, setPhotoUrl] = useState(defaults.photoUrl);

    const inWorkflow = workflowStep != null && mode === "create";
    const showStep = (n: number) => !inWorkflow || workflowStep === n;
    const isReview = inWorkflow && workflowStep === 3;

    function resetEmpty() {
      setFirstName("");
      setLastName("");
      setCompanyId("");
      setPhotoUrl("");
      setFieldErrors({});
      setError(null);
    }

    async function submit() {
      const ve = validate(firstName, lastName, photoUrl);
      setFieldErrors(ve);
      if (Object.keys(ve).length) {
        setError("Fix the highlighted fields.");
        return;
      }
      const companyIdNum = companyId ? Number(companyId) : undefined;
      const fn = firstName.trim();
      const ln = lastName.trim();
      const pu = photoUrl.trim();

      if (mode === "create") {
        let nextHref: string | undefined;
        await run(
          async () => {
            const payload: Record<string, unknown> = {
              firstName: fn,
              lastName: ln,
            };
            if (companyIdNum != null && Number.isFinite(companyIdNum)) {
              payload.companyId = companyIdNum;
            }
            if (pu) payload.photoUrl = pu;
            const created = await apiPost<{ id: number }>("/workers", payload);
            if (!created?.id) throw new Error("Invalid response from server");
            nextHref = `/admin/workers/${created.id}`;
          },
          {
            successTitle: "Worker created",
            successDescription: `${fn} ${ln} was added.`,
            redirectTo: () => nextHref,
            onSuccess: () => resetEmpty(),
          },
        );
        return;
      }

      if (!initial?.id) throw new Error("Missing worker id");
      await run(
        async () => {
          await apiPatch(`/workers/${initial.id}`, {
            firstName: fn,
            lastName: ln,
            companyId:
              companyIdNum != null && Number.isFinite(companyIdNum)
                ? companyIdNum
                : null,
            photoUrl: pu || null,
          });
        },
        {
          successTitle: "Worker updated",
          redirectTo: `/admin/workers/${initial.id}`,
        },
      );
    }

    useImperativeHandle(ref, () => ({
      validateWorkflowStep(step: number) {
        if (step === 0) {
          const ve = validate(firstName, lastName, photoUrl);
          if (ve.firstName || ve.lastName) {
            setFieldErrors(ve);
            return ve.firstName ?? ve.lastName ?? "Enter the worker's name.";
          }
          setFieldErrors({});
          return null;
        }
        if (step === 1) {
          setFieldErrors({});
          return null;
        }
        return null;
      },
      submit: () => {
        void submit();
      },
    }));

    /** Training-only step: parent renders content; keep hidden submit only. */
    if (inWorkflow && workflowStep === 2) {
      return (
        <button
          type="button"
          id={submitButtonId}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onClick={() => void submit()}
        />
      );
    }

    const shellClass = inWorkflow ? "space-y-vera-6" : "space-y-vera-6 p-vera-8";

    const inner = (
      <>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-vera-4 py-vera-3 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        ) : null}
        <form
          className="space-y-vera-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (inWorkflow && workflowStep != null && workflowStep < 3) return;
            void submit();
          }}
        >
          {isReview ? (
            <section className="space-y-4" aria-labelledby="worker-review-heading">
              <h3 id="worker-review-heading" className="text-base font-semibold text-[#111827]">
                Review before creating
              </h3>
              <dl className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[#6B7280]">Name</dt>
                  <dd className="font-medium text-[#111827]">
                    {firstName.trim() || lastName.trim() ? (
                      <>
                        {firstName.trim()} {lastName.trim()}
                      </>
                    ) : (
                      <span className="text-red-600">Not entered — go back to step 1</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B7280]">Employer</dt>
                  <dd className="font-medium text-[#111827]">
                    {companyId
                      ? (companies.find((c) => String(c.id) === companyId)?.name ??
                        "—")
                      : "Unassigned (no company)"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[#6B7280]">Training certificates</dt>
                  <dd className="text-[#111827]">
                    Optional — add after create from training module
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          {showStep(0) ? (
            <>
              <div className="space-y-vera-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  aria-invalid={!!fieldErrors.firstName}
                />
                {fieldErrors.firstName ? (
                  <p className="text-sm text-red-600">{fieldErrors.firstName}</p>
                ) : null}
              </div>
              <div className="space-y-vera-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  aria-invalid={!!fieldErrors.lastName}
                />
                {fieldErrors.lastName ? (
                  <p className="text-sm text-red-600">{fieldErrors.lastName}</p>
                ) : null}
              </div>
              {!inWorkflow ? (
                <div className="space-y-vera-2">
                  <Label htmlFor="photoUrl">Photo URL</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://…"
                    aria-invalid={!!fieldErrors.photoUrl}
                  />
                  {fieldErrors.photoUrl ? (
                    <p className="text-sm text-red-600">{fieldErrors.photoUrl}</p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}

          {showStep(1) ? (
            <section className="space-y-vera-2">
              <Label htmlFor="companyId">Employer (company roster)</Label>
              <p className="text-xs text-vera-muted">
                Which company this person is on-boarded with on site. Training schools that
                issued their certificates are chosen on each training record, not here.
              </p>
              <Select
                id="companyId"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                <option value="">None (unassigned pool)</option>
                {companies.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </section>
          ) : null}

          {!inWorkflow ? (
            <section className="flex flex-wrap gap-vera-3">
              <Button type="submit" variant="teal" disabled={pending} id={submitButtonId}>
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : mode === "create" ? (
                  <Plus className="h-4 w-4" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}
                {pending ? "Saving…" : mode === "create" ? "Create worker" : "Save changes"}
              </Button>
              <Link href={cancelHref} className={buttonStyles({ variant: "outline" })}>
                <X className="h-4 w-4" aria-hidden />
                Cancel
              </Link>
              {mode === "create" ? (
                <Link href={listHref} className={buttonStyles({ variant: "ghost" })}>
                  Back to list
                </Link>
              ) : null}
            </section>
          ) : (
            <button
              type="submit"
              id={submitButtonId}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            >
              Submit
            </button>
          )}
        </form>
      </>
    );

    if (inWorkflow) {
      return <div className={shellClass}>{inner}</div>;
    }

    return <CardContent className={shellClass}>{inner}</CardContent>;
  },
);
