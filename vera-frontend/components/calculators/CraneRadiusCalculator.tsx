"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calcCraneRadius } from "@/lib/calculators/calculations";
import {
  craneRadiusSchema,
  type CraneRadiusForm,
} from "@/lib/calculators/schemas";
import { CalculatorShell } from "./CalculatorShell";
import { CalculatorResult } from "./CalculatorResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaults: CraneRadiusForm = {
  boomLengthM: 30,
  boomAngleDeg: 45,
};

export function CraneRadiusCalculator() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CraneRadiusForm>({
    resolver: zodResolver(craneRadiusSchema),
    defaultValues: defaults,
    mode: "onChange",
  });

  const values = watch();
  const result = useMemo(() => {
    const parsed = craneRadiusSchema.safeParse(values);
    if (!parsed.success) return null;
    try {
      return calcCraneRadius(parsed.data);
    } catch {
      return null;
    }
  }, [values]);

  return (
    <CalculatorShell
      title="Crane radius estimator"
      description="Rough horizontal reach from boom length and angle (plan view)."
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
              <Label htmlFor="boomLengthM">Boom length (m)</Label>
              <Input
                id="boomLengthM"
                type="number"
                step="0.1"
                {...register("boomLengthM")}
              />
              {errors.boomLengthM ? (
                <p className="text-xs text-red-600">{errors.boomLengthM.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="boomAngleDeg">Boom angle from horizontal (°)</Label>
              <Input
                id="boomAngleDeg"
                type="number"
                step="0.1"
                {...register("boomAngleDeg")}
              />
              {errors.boomAngleDeg ? (
                <p className="text-xs text-red-600">{errors.boomAngleDeg.message}</p>
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
          label="Radius estimate"
          value={`${result.radiusM.toFixed(2)} m`}
          formula={result.formula}
          note="Does not include deflection, load chart limits, or counterweight — use lift plan."
        />
      ) : null}
    </CalculatorShell>
  );
}
