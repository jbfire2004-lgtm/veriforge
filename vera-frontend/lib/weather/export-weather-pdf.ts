import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { WeatherHazardSnapshot } from "./types";

export async function exportWeatherPdf(snapshot: WeatherHazardSnapshot): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]);
  const { height } = page.getSize();
  let y = height - 50;

  const draw = (text: string, size = 11, useBold = false) => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font: useBold ? bold : font,
      color: rgb(0.1, 0.16, 0.25),
    });
    y -= size + 6;
  };

  draw("VERA — Weather & hazard report", 16, true);
  draw(`Location: ${snapshot.location.label}`, 11);
  draw(`Generated: ${new Date(snapshot.fetchedAt).toLocaleString()}`, 10);
  y -= 8;
  draw(`Conditions: ${snapshot.conditions}`, 11);
  draw(`Temperature: ${snapshot.temperatureC.toFixed(1)}°C`, 11);
  draw(`Wind: ${snapshot.windSpeedKmh.toFixed(0)} km/h · Gusts ${snapshot.windGustKmh.toFixed(0)} km/h`, 11);
  draw(`Lightning: ${snapshot.lightningLabel} (${snapshot.lightningRisk})`, 11);
  draw(`Thermal stress: ${snapshot.heatColdLabel}`, 11);
  draw(`Air quality: ${snapshot.aqiLabel}`, 11);
  draw(`Fire ban signal: ${snapshot.fireBanLabel}`, 11);
  y -= 8;
  draw("Safety advisories", 13, true);
  if (snapshot.advisories.length === 0) {
    draw("No active advisories.", 10);
  } else {
    for (const a of snapshot.advisories) {
      const lines = wrapText(a, 80);
      for (const line of lines) draw(line, 10);
      y -= 4;
    }
  }
  y -= 8;
  draw("Hourly forecast (next 24h)", 13, true);
  for (const h of snapshot.hourly.slice(0, 24)) {
    const t = new Date(h.time).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
    });
    draw(
      `${t} — ${h.temperatureC.toFixed(0)}°C · wind ${h.windSpeedKmh.toFixed(0)}/${h.windGustKmh.toFixed(0)} km/h`,
      9,
    );
    if (y < 60) break;
  }

  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxLen) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
