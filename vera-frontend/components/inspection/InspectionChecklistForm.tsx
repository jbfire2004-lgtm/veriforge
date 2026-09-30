"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChecklistItem, InspectionType } from "@/lib/api/inspection";
import { submitInspection } from "@/lib/api/inspection";
import {
  fetchCoreUploadConfig,
  uploadCoreFile,
} from "@/lib/core-upload";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";

type Props = {
  equipmentId: number;
  equipmentName: string;
  checklistId: number;
  inspectionType: InspectionType;
  items: ChecklistItem[];
  workerId?: number;
  redirectTo?: string;
  title: string;
};

export function InspectionChecklistForm({
  equipmentId,
  equipmentName,
  checklistId,
  inspectionType,
  items,
  workerId,
  redirectTo,
  title,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, { passed: boolean; notes?: string }>>(
    () => Object.fromEntries(items.map((i) => [i.id, { passed: true }])),
  );
  const [correctiveActions, setCorrectiveActions] = useState("");
  const [meterReading, setMeterReading] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onPhotoSelected(file: File | null) {
    if (!file) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const config = await fetchCoreUploadConfig();
      const uploaded = await uploadCoreFile(file, config, { purpose: "inspection" });
      const url = uploaded.publicUrl ?? `/api/v1/core/uploads/${uploaded.id}`;
      setPhotoUrls((prev) => [...prev, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  }

  const allPassed = useMemo(
    () => items.every((i) => !i.required || answers[i.id]?.passed !== false),
    [items, answers],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const passed = allPassed;
    try {
      await submitInspection({
        equipmentId,
        workerId,
        checklistId,
        inspectionType,
        checklist: answers,
        passed,
        correctiveActions: passed ? undefined : correctiveActions || "Failed checklist items",
        meterReading: meterReading ? Number(meterReading) : undefined,
        photos: photoUrls.length ? photoUrls : undefined,
      });
      router.push(redirectTo ?? `/admin/equipment/${equipmentId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{equipmentName}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <section
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <Label className="font-normal">
                {item.label}
                {item.required ? <span className="text-destructive"> *</span> : null}
              </Label>
              <section className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={answers[item.id]?.passed ? "teal" : "outline"}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, [item.id]: { ...a[item.id], passed: true } }))
                  }
                >
                  Pass
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={answers[item.id]?.passed === false ? "danger" : "outline"}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, [item.id]: { ...a[item.id], passed: false } }))
                  }
                >
                  Fail
                </Button>
              </section>
            </section>
          ))}

          {(inspectionType === "PME" || inspectionType === "SCHEDULED") && (
            <section>
              <Label htmlFor="meter">Meter hours</Label>
              <Input
                id="meter"
                type="number"
                step="0.1"
                value={meterReading}
                onChange={(e) => setMeterReading(e.target.value)}
                placeholder="Current hour meter reading"
              />
            </section>
          )}

          <section>
            <Label htmlFor="photos">Photos (optional)</Label>
            <Input
              id="photos"
              type="file"
              accept="image/*"
              disabled={uploadingPhoto}
              onChange={(e) => onPhotoSelected(e.target.files?.[0] ?? null)}
            />
            {photoUrls.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {photoUrls.length} photo{photoUrls.length === 1 ? "" : "s"} attached
              </p>
            )}
          </section>

          {!allPassed && (
            <section>
              <Label htmlFor="corrective">Corrective actions required</Label>
              <Input
                id="corrective"
                value={correctiveActions}
                onChange={(e) => setCorrectiveActions(e.target.value)}
                placeholder="Describe defect and required repair"
                required
              />
            </section>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="teal" disabled={submitting}>
            {submitting ? "Submitting…" : allPassed ? "Complete — pass" : "Submit — fail & lockout"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
