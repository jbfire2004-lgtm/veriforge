"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/toast";

export function useAdminMutation() {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (
      fn: () => Promise<void>,
      options?: {
        successTitle?: string;
        successDescription?: string;
        redirectTo?: string | (() => string | undefined | null);
        /** Clear controlled fields after success (e.g. create-another). */
        onSuccess?: () => void;
      }
    ) => {
      setPending(true);
      setError(null);
      try {
        await fn();
        toast({
          variant: "success",
          title: options?.successTitle ?? "Saved",
          description: options?.successDescription,
        });
        options?.onSuccess?.();
        const dest =
          typeof options?.redirectTo === "function"
            ? options.redirectTo()
            : options?.redirectTo;
        if (dest) {
          router.push(dest);
        }
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Request failed";
        setError(msg);
        toast({
          variant: "error",
          title: "Something went wrong",
          description: msg,
        });
      } finally {
        setPending(false);
      }
    },
    [router, toast]
  );

  return { pending, error, setError, run };
}
