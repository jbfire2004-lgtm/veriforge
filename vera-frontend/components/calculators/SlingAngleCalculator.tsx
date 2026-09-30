"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calcSlingAngleLoad } from "@/lib/calculators/calculations";
import {
  slingAngleSchema,
  type SlingAngleForm,
} from "@/lib/calculators/schemas";
import { CalculatorShell } from "./CalculatorShell";
import { CalculatorResult } from "./CalculatorResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaults: SlingAngleForm = {
  loadWeightKg: 1000,
  slingAngleDeg: 45,
};

export function SlingAngleCalculator() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<SlingAngleForm>({
    resolver: zodResolver(slingAngleSchema),
    defaultValues: defaults,
    mode: "onChange",
  });

  const values = watch();
  const result = useMemo(() => {
    const parsed = slingAngleSchema.safeParse(values);
    if (!parsed.success) return null;
    try {
      return calcSlingAngleLoad(parsed.data);
    } catch {
      return null;
    }
  }, [values]);

  return (
    <CalculatorShell
      title="Sling angle / load"
      description="Symmetric two-leg hitch — tension per leg from load and angle from horizontal."
    >
      <Card className="border-[#2A2E33]/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-[0.06em] text-[#2A2E33]">
            Inputs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit(() => undefined)}
          >
            <div className="space-y-2">
              <Label htmlFor="loadWeightKg">Load weight (kg)</Label>
              <Input
                id="loadWeightKg"
                type="number"
                step="1"
                {...register("loadWeightKg")}
              />
              {errors.loadWeightKg ? (
                <p className="text-xs text-red-600">{errors.loadWeightKg.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slingAngleDeg">Sling angle from horizontal (°)</Label>
              <Input
                id="slingAngleDeg"
                type="number"
                step="0.1"
                {...register("slingAngleDeg")}
              />
              {errors.slingAngleDeg ? (
                <p className="text-xs text-red-600">{errors.slingAngleDeg.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="sr-only">
              Calculate
            </Button>
          </form>
        </CardContent>
      </Card>

      {result ? (
        <CalculatorResult
          label="Tension per leg"
          value={`${result.tensionPerLegKg.toFixed(0)} kg (${result.tensionPerLegLb.toFixed(0)} lb)`}
          formula={result.formula}
          note="Lower sling angles sharply increase leg tension — stay within WLL and rigging plan."
        />
      ) : null}
    </CalculatorShell>
  );
}
