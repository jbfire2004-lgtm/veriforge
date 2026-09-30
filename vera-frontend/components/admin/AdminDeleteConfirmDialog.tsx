"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { apiDelete } from "@/lib/api";
import { Button, Modal } from "@/components/ui";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

type Props = {
  /** Display name of the thing being deleted (e.g. "Acme Co" or "Worker #12"). */
  entityName: string;
  /** Singular noun for the title, e.g. "company", "worker". */
  entityKind: string;
  /** API path including leading slash, e.g. `/workers/12`. */
  apiPath: string;
  /** Where to send the user after a successful delete. */
  redirectTo: string;
  /** Where to send the user if they cancel/close the modal. */
  cancelHref: string;
  successTitle?: string;
  successDescription?: string;
  /** Optional extra paragraph above the warning, e.g. cascading impact. */
  body?: React.ReactNode;
};

export function AdminDeleteConfirmDialog({
  entityName,
  entityKind,
  apiPath,
  redirectTo,
  cancelHref,
  successTitle,
  successDescription,
  body,
}: Props) {
  const router = useRouter();
  const { pending, error, run } = useAdminMutation();
  const [open, setOpen] = useState(true);

  function close() {
    setOpen(false);
    router.push(cancelHref);
  }

  async function confirm() {
    await run(
      async () => {
        await apiDelete(apiPath);
      },
      {
        successTitle: successTitle ?? `${entityKind[0].toUpperCase()}${entityKind.slice(1)} deleted`,
        successDescription,
        redirectTo,
      }
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o && !pending) close();
      }}
      dismissOnBackdrop={!pending}
      title={
        <span className="flex items-center gap-vera-2 text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          Delete {entityKind}?
        </span>
      }
      description={
        <>
          You&apos;re about to permanently delete{" "}
          <span className="font-semibold text-vera-charcoal">{entityName}</span>.
        </>
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={pending}
            autoFocus
          >
            <X className="h-4 w-4" aria-hidden />
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void confirm()}
            disabled={pending}
            aria-label={`Confirm delete ${entityKind}: ${entityName}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {pending ? "Deleting…" : `Yes, delete ${entityKind}`}
          </Button>
        </>
      }
    >
      <div className="space-y-vera-4">
        {body ?? (
          <p className="text-vera-charcoal">
            This action cannot be undone. Any records that reference this {entityKind} may
            also be affected.
          </p>
        )}
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-vera-4 py-vera-3 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
