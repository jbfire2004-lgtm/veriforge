import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { adminApi, getApiErrorMessage } from "../../lib/api";
import { formatCents } from "../../lib/format";
import type { ModuleCode } from "../../types/api";

export function AdminPricingConfig() {
  const qc = useQueryClient();
  const [discount, setDiscount] = useState(17);
  const [monthly, setMonthly] = useState<Record<ModuleCode, number>>({
    vericore: 0,
    veripm: 0,
    verihub: 0,
  });
  const [message, setMessage] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: async () => {
      const { data } = await adminApi.getPricing();
      return data;
    },
  });

  useEffect(() => {
    if (!query.data) return;
    setDiscount(query.data.annualDiscountPercent);
    const next = { ...monthly };
    for (const m of query.data.modules) {
      next[m.code] = m.monthlyCents;
    }
    setMonthly(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once when config loads
  }, [query.data]);

  const save = useMutation({
    mutationFn: async () => {
      const modulePrices = (Object.keys(monthly) as ModuleCode[]).map((code) => ({
        code,
        monthlyCents: monthly[code],
      }));
      const { data } = await adminApi.updatePricing({
        annualDiscountPercent: discount,
        modulePrices,
      });
      return data;
    },
    onSuccess: async () => {
      setMessage("Pricing updated. New quotes will use these list prices.");
      await qc.invalidateQueries({ queryKey: ["admin-pricing"] });
    },
  });

  if (query.isLoading) return <p className="text-white/60">Loading pricing…</p>;
  if (query.error) return <p className="text-red-300">{getApiErrorMessage(query.error)}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Pricing configuration</h1>
        <p className="mt-1 text-white/60">
          Base monthly prices per module and annual discount. Annual list prices are recomputed as
          monthly × 12 × (1 − discount).
        </p>
      </div>

      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {save.error && <p className="text-sm text-red-300">{getApiErrorMessage(save.error)}</p>}

      <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-white/60">Annual discount (%)</span>
          <input
            type="number"
            min={0}
            max={80}
            className="w-full rounded-lg border border-white/15 bg-[#0c1210] px-3 py-2"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </label>

        {(query.data?.modules ?? []).map((m) => (
          <label key={m.code} className="block text-sm">
            <span className="mb-1 block text-white/60">
              {m.name} monthly (cents) — currently {formatCents(m.monthlyCents, query.data!.currency)}
            </span>
            <input
              type="number"
              min={0}
              step={100}
              className="w-full rounded-lg border border-white/15 bg-[#0c1210] px-3 py-2"
              value={monthly[m.code]}
              onChange={(e) =>
                setMonthly((prev) => ({ ...prev, [m.code]: Number(e.target.value) }))
              }
            />
            <p className="mt-1 text-xs text-white/40">
              Implied annual ≈{" "}
              {formatCents(
                Math.round(monthly[m.code] * 12 * (1 - discount / 100)),
                query.data!.currency,
              )}
            </p>
          </label>
        ))}

        <button
          type="button"
          className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? "Saving…" : "Save pricing"}
        </button>
      </section>
    </div>
  );
}
