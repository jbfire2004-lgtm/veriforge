"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import {
  BRIEFING_CONTROLS,
  BRIEFING_HAZARDS,
  BRIEFING_JOB_TYPES,
} from "@/lib/briefing/briefing-options";
import {
  briefingFormSchema,
  type BriefingFormValues,
} from "@/lib/briefing/briefing-schema";
import { useBriefingWeather } from "@/lib/briefing/use-briefing-weather";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";

type Props = {
  onSubmit: (values: BriefingFormValues) => void;
  generating?: boolean;
};

function MultiCheckboxGroup({
  label,
  options,
  selected,
  onChange,
  error,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  error?: string;
}) {
  const toggle = (item: string) => {
    onChange(
      selected.includes(item)
        ? selected.filter((s) => s !== item)
        : [...selected, item],
    );
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-vera-charcoal">{label}</legend>
      <div className="grid max-h-44 gap-2 overflow-y-auto rounded-xl border border-vera-charcoal/10 bg-vera-surface/50 p-3 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-xs transition",
              selected.includes(opt)
                ? "border-[#2F8F8C]/40 bg-[#E4F3F2] text-[#2A2E33]"
                : "border-transparent bg-white hover:border-vera-charcoal/15",
            )}
          >
            <input
              type="checkbox"
              className="mt-0.5 accent-[#2F8F8C]"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </fieldset>
  );
}

export function BriefingForm({ onSubmit, generating }: Props) {
  const weather = useBriefingWeather();

  const form = useForm<BriefingFormValues>({
    resolver: zodResolver(briefingFormSchema),
    defaultValues: {
      jobType: "",
      crewSize: 6,
      hazards: [],
      controls: [],
      notes: "",
      weatherSummary: "",
      includeWeather: true,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const hazards = watch("hazards") ?? [];
  const controls = watch("controls") ?? [];
  const includeWeather = watch("includeWeather");

  useEffect(() => {
    if (includeWeather && weather.summary) {
      setValue("weatherSummary", weather.summary, { shouldDirty: false });
    }
  }, [includeWeather, weather.summary, setValue]);

  return (
    <Card className="h-full border-vera-charcoal/10 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Briefing inputs</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="jobType" required>
              Job type
            </Label>
            <Select id="jobType" aria-invalid={!!errors.jobType} {...register("jobType")}>
              <option value="">Select job type…</option>
              {BRIEFING_JOB_TYPES.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </Select>
            {errors.jobType ? (
              <p className="text-xs text-red-600">{errors.jobType.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="crewSize" required>
              Crew size
            </Label>
            <Input
              id="crewSize"
              type="number"
              min={1}
              max={500}
              aria-invalid={!!errors.crewSize}
              {...register("crewSize")}
            />
            {errors.crewSize ? (
              <p className="text-xs text-red-600">{errors.crewSize.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-xl border border-[#2F8F8C]/20 bg-[#E4F3F2]/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="includeWeather">Weather (auto-fill)</Label>
              <label className="flex items-center gap-2 text-xs text-[#5a6b7c]">
                <input
                  type="checkbox"
                  className="accent-[#2F8F8C]"
                  {...register("includeWeather")}
                />
                Include
              </label>
            </div>
            {weather.isLoading ? (
              <p className="flex items-center gap-2 text-xs text-[#64748b]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading from hazard bar…
              </p>
            ) : (
              <Textarea
                id="weatherSummary"
                readOnly={includeWeather && weather.ready}
                className="min-h-[100px] text-xs"
                placeholder="Weather will auto-fill from your hub location"
                {...register("weatherSummary")}
              />
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void weather.refetch()}
              disabled={weather.isLoading}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh weather
            </Button>
          </div>

          <MultiCheckboxGroup
            label="Hazards"
            options={BRIEFING_HAZARDS}
            selected={hazards}
            onChange={(next) => setValue("hazards", next, { shouldValidate: true })}
            error={errors.hazards?.message}
          />

          <MultiCheckboxGroup
            label="Controls"
            options={BRIEFING_CONTROLS}
            selected={controls}
            onChange={(next) => setValue("controls", next, { shouldValidate: true })}
            error={errors.controls?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Site-specific risks, SIMOPS, isolation boundaries, etc."
              {...register("notes")}
            />
          </div>

          <Button type="submit" variant="teal" className="w-full" disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate briefing
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
