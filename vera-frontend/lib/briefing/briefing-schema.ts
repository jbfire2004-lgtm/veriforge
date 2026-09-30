import { z } from "zod";

export const briefingFormSchema = z.object({
  jobType: z.string().min(1, "Select a job type"),
  crewSize: z.coerce
    .number({ error: "Enter crew size" })
    .int()
    .min(1, "At least one crew member")
    .max(500, "Crew size too large"),
  hazards: z.array(z.string()).min(1, "Select at least one hazard"),
  controls: z.array(z.string()).min(1, "Select at least one control"),
  notes: z.string().max(4000).optional(),
  weatherSummary: z.string().optional(),
  includeWeather: z.boolean().default(true),
});

export type BriefingFormValues = z.infer<typeof briefingFormSchema>;
