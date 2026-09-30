"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calcConfinedSpaceVentilation } from "@/lib/calculators/calculations";
import {
  confinedSpaceSchema,
  type ConfinedSpaceForm,
} from "@/lib/calculators/schemas";
import { CalculatorShell } from "./CalculatorShell";
import { CalculatorResult } from "./CalculatorResult";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaults: ConfinedSpaceForm = {
  volumeM3: 50,
  ventilationRateM3PerMin: 10,
  targetAirChanges: 4,
};

export function ConfinedSpaceCalculator() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfinedSpaceForm>({
    resolver: zodResolver(confinedSpaceSchema),
    defaultValues: defaults,
    mode: "onChange",
  });

  const values = watch();
  const result = useMemo(() => {
    const parsed = confinedSpaceSchema.safeParse(values);
    if (!parsed.success) return null;
    try {
      return calcConfinedSpaceVentilation(parsed.data);
    } catch {
      return null;
    }
  }, [values]);

  return (
    <CalculatorShell
      title="Confined space ventilation"
      description="Time to reach target air changes at a given ventilation rate."
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
              <Label htmlFor="volumeM3">Volume of space (m³)</Label>
              <Input
                id="volumeM3"
                type="number"
                step="0.1"
                {...register("volumeM3")}
              />
              {errors.volumeM3 ? (
                <p className="text-xs text-red-600">{errors.volumeM3.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ventilationRateM3PerMin">
                Ventilation rate (m³/min)
              </Label>
              <Input
                id="ventilationRateM3PerMin"
                type="number"
                step="0.1"
                {...register("ventilationRateM3PerMin")}
              />
              {errors.ventilationRateM3PerMin ? (
                <p className="text-xs text-red-600">
                  {errors.ventilationRateM3PerMin.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="targetAirChanges">
                Target air changes (default 4)
              </Label>
              <Input
                id="targetAirChanges"
                type="number"
                step="1"
                {...register("targetAirChanges")}
              />
            </div>
            <Button type="submit" className="sr-only">
              Calculate
            </Button>
          </form>
        </CardContent>
      </Card>

      {result ? (
        <CalculatorResult
          label="Time to achieve safe air changes"
          value={
            result.timeMinutes >= 60
              ? `${(result.timeMinutes / 60).toFixed(2)} hr (${result.timeMinutes.toFixed(0)} min)`
              : `${result.timeMinutes.toFixed(1)} min`
          }
          formula={result.formula}
          note={`Assumes ${result.airChanges} complete air changes; confirm with gas monitoring and permit requirements.`}
        />
      ) : null}
    </CalculatorShell>
  );
}
