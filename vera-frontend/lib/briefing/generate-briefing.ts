import { BRIEFING_JOB_TYPES } from "./briefing-options";
import type { BriefingGenerateInput, GeneratedBriefing, BriefingSection } from "./briefing-types";

function jobLabel(jobType: string, override?: string): string {
  if (override) return override;
  return BRIEFING_JOB_TYPES.find((j) => j.value === jobType)?.label ?? jobType;
}

function buildSections(input: BriefingGenerateInput): BriefingSection[] {
  const job = jobLabel(input.jobType, input.jobTypeLabel);
  const hazards = input.hazards.map((h) => `• ${h}`).join("\n");
  const controls = input.controls.map((c) => `• ${c}`).join("\n");
  const weather =
    input.includeWeather && input.weatherSummary?.trim()
      ? input.weatherSummary.trim()
      : "Weather not included — confirm local conditions before work starts.";

  const crewLines = Array.from({ length: Math.min(input.crewSize, 12) }, (_, i) => {
    const role =
      i === 0
        ? "Supervisor / lead"
        : i === 1
          ? "Safety watch (as assigned)"
          : `Crew member ${i + 1}`;
    return `• ${role}: _________________________`;
  });
  if (input.crewSize > 12) {
    crewLines.push(`• Additional ${input.crewSize - 12} workers — attach roster`);
  }

  const notes = input.notes?.trim()
    ? input.notes.trim()
    : "No additional site notes provided.";

  return [
    {
      id: "overview",
      heading: "Job overview",
      body: `Work type: ${job}\nCrew size: ${input.crewSize}\nBriefing type: Toolbox talk / FLHA / crew briefing\n\n${notes}`,
    },
    {
      id: "weather",
      heading: "Weather conditions",
      body: weather,
    },
    {
      id: "hazards",
      heading: "Identified hazards",
      body: hazards,
    },
    {
      id: "controls",
      heading: "Control measures",
      body: controls,
    },
    {
      id: "crew",
      heading: "Crew assignments",
      body: crewLines.join("\n"),
    },
    {
      id: "signoff",
      heading: "Sign-off",
      body: [
        "I confirm this briefing was delivered, hazards discussed, and controls understood before work begins.",
        "",
        "Supervisor signature: _________________________  Date: __________  Time: __________",
        "",
        "Crew acknowledgement (initials):",
        "_________________________________________________________",
        "",
        "Emergency muster point: _________________________",
        "Emergency contact: _________________________",
      ].join("\n"),
    },
  ];
}

function toMarkdown(title: string, sections: BriefingSection[]): string {
  const lines = [`# ${title}`, ""];
  for (const s of sections) {
    lines.push(`## ${s.heading}`, "", s.body, "");
  }
  return lines.join("\n");
}

function toPlainText(title: string, sections: BriefingSection[]): string {
  const lines = [title.toUpperCase(), "=".repeat(title.length), ""];
  for (const s of sections) {
    lines.push(s.heading.toUpperCase(), "-".repeat(s.heading.length), s.body, "");
  }
  return lines.join("\n");
}

/** Template-based briefing (always available). */
export function generateBriefingTemplate(input: BriefingGenerateInput): GeneratedBriefing {
  const title = `Daily safety briefing — ${jobLabel(input.jobType, input.jobTypeLabel)}`;
  const sections = buildSections(input);
  return {
    title,
    generatedAt: new Date().toISOString(),
    source: "template",
    sections,
    markdown: toMarkdown(title, sections),
    plainText: toPlainText(title, sections),
  };
}

/**
 * OpenAI generation (server-side). Returns null when API key or call fails.
 * Set OPENAI_API_KEY and optional OPENAI_MODEL (default gpt-4o-mini).
 */
export async function generateBriefingWithOpenAI(
  input: BriefingGenerateInput,
): Promise<GeneratedBriefing | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const job = jobLabel(input.jobType, input.jobTypeLabel);

  const system = `You are a workplace safety professional writing field-ready toolbox talks and FLHAs for industrial construction. Be concise, actionable, and aligned with Canadian OHS practice. Output valid JSON only.`;

  const user = JSON.stringify({
    instruction:
      "Generate a daily safety briefing with sections: jobOverview, weatherConditions, identifiedHazards, controlMeasures, crewAssignments, signOff. Use plain text with bullet points where appropriate.",
    job,
    crewSize: input.crewSize,
    hazards: input.hazards,
    controls: input.controls,
    notes: input.notes ?? "",
    weather: input.includeWeather ? input.weatherSummary ?? "" : "Not provided",
  });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Record<string, string>;
    const map: Array<{ id: string; key: string; heading: string }> = [
      { id: "overview", key: "jobOverview", heading: "Job overview" },
      { id: "weather", key: "weatherConditions", heading: "Weather conditions" },
      { id: "hazards", key: "identifiedHazards", heading: "Identified hazards" },
      { id: "controls", key: "controlMeasures", heading: "Control measures" },
      { id: "crew", key: "crewAssignments", heading: "Crew assignments" },
      { id: "signoff", key: "signOff", heading: "Sign-off" },
    ];

    const sections: BriefingSection[] = map.map(({ id, key, heading }) => ({
      id,
      heading,
      body: String(parsed[key] ?? "").trim() || "—",
    }));

    const title = `Daily safety briefing — ${job}`;
    return {
      title,
      generatedAt: new Date().toISOString(),
      source: "openai",
      sections,
      markdown: toMarkdown(title, sections),
      plainText: toPlainText(title, sections),
    };
  } catch {
    return null;
  }
}

/** Prefer OpenAI when configured; otherwise structured template. */
export async function generateBriefing(
  input: BriefingGenerateInput,
  options?: { preferOpenAi?: boolean },
): Promise<GeneratedBriefing> {
  if (options?.preferOpenAi !== false) {
    const ai = await generateBriefingWithOpenAI(input);
    if (ai) return ai;
  }
  return generateBriefingTemplate(input);
}
