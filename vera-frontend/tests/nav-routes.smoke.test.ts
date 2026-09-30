import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.join(process.cwd());
const NAV_PATH = path.join(ROOT, "lib/navigation/vera-nav-config.ts");
const APP_DIR = path.join(ROOT, "app");

function collectNavHrefs(): string[] {
  const text = fs.readFileSync(NAV_PATH, "utf8");
  const hrefs = [...text.matchAll(/href:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  return [
    ...new Set(
      hrefs
        .filter((h) => h.startsWith("/") && !h.startsWith("http"))
        .map((h) => h.split("?")[0]!),
    ),
  ];
}

function resolvePageFile(routePath: string): string | null {
  const segments = routePath.split("/").filter(Boolean);
  let cur = APP_DIR;
  for (const seg of segments) {
    if (!fs.existsSync(cur)) return null;
    const entries = fs.readdirSync(cur);
    if (entries.includes(seg)) {
      cur = path.join(cur, seg);
      continue;
    }
    const dynamic = entries.find((e) => e.startsWith("[") && e.endsWith("]"));
    if (dynamic) {
      cur = path.join(cur, dynamic);
      continue;
    }
    return null;
  }
  const page = path.join(cur, "page.tsx");
  return fs.existsSync(page) ? page : null;
}

describe("vera-nav-config routes resolve to app pages", () => {
  const hrefs = collectNavHrefs();

  it("has nav entries to validate", () => {
    expect(hrefs.length).toBeGreaterThan(20);
  });

  for (const href of hrefs) {
    it(`resolves ${href}`, () => {
      expect(resolvePageFile(href)).not.toBeNull();
    });
  }
});
