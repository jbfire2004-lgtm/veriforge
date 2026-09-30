import type { ReadonlyURLSearchParams } from "next/navigation";
import { describe, expect, test } from "vitest";
import {
  parseRequiredPositiveIntParam,
  parseSupervisorQrText,
  parseWorkerEquipmentParams,
  preUseSignoffRedirectPath,
  supervisorScanModeFromSearchParams,
  SUPERVISOR_SCAN_MODES,
} from "./field-scan";

function qp(s: string): ReadonlyURLSearchParams {
  return new URLSearchParams(s) as unknown as ReadonlyURLSearchParams;
}

describe("supervisorScanModeFromSearchParams", () => {
  test("defaults to worker", () => {
    expect(supervisorScanModeFromSearchParams(null)).toBe("worker");
    expect(supervisorScanModeFromSearchParams(qp(""))).toBe("worker");
  });

  test("accepts only whitelisted modes", () => {
    expect(supervisorScanModeFromSearchParams(qp("mode=equipment"))).toBe(
      "equipment"
    );
    expect(supervisorScanModeFromSearchParams(qp("mode=nope"))).toBe("worker");
  });

  test("scan mode union is stable", () => {
    expect(SUPERVISOR_SCAN_MODES.length).toBe(3);
  });
});

describe("parseRequiredPositiveIntParam", () => {
  test("rejects empty and non-numeric", () => {
    expect(parseRequiredPositiveIntParam(null).ok).toBe(false);
    expect(parseRequiredPositiveIntParam("").ok).toBe(false);
    expect(parseRequiredPositiveIntParam("abc").ok).toBe(false);
    expect(parseRequiredPositiveIntParam("01").ok).toBe(false);
  });

  test("accepts integers", () => {
    const x = parseRequiredPositiveIntParam("42");
    expect(x.ok && x.value).toBe(42);
  });
});

describe("parseWorkerEquipmentParams", () => {
  test("requires both", () => {
    const a = parseWorkerEquipmentParams("1", null);
    expect(a.ok).toBe(false);
    const b = parseWorkerEquipmentParams("1", "2");
    expect(b.ok && b.workerId === 1 && b.equipmentId === 2).toBe(true);
  });
});

describe("parseSupervisorQrText (scan worker / scan equipment)", () => {
  test("worker verify URL", () => {
    const p = parseSupervisorQrText("https://app/verify/42", "worker");
    expect(p.ok && p.kind === "worker" && p.id === 42).toBe(true);
  });

  test("equipment verify URL", () => {
    const p = parseSupervisorQrText(
      "https://app/verify/equipment?id=9",
      "equipment",
    );
    expect(p.ok && p.kind === "equipment" && p.id === 9).toBe(true);
  });

  test("equipment QR redirect avoids admin paths", () => {
    const path = preUseSignoffRedirectPath({ workerId: null, equipmentId: 9 });
    expect(path).toBe("/supervisor/equipment/9");
    expect(path.includes("/admin/")).toBe(false);
  });

  test("equipment JSON envelope", () => {
    const p = parseSupervisorQrText('{"type":"equipment","id":9}', "equipment");
    expect(p.ok && p.kind === "equipment" && p.id === 9).toBe(true);
  });

  test("combined URL resolves two IDs", () => {
    const p = parseSupervisorQrText(
      "https://x/local/scan/combined?worker=1&equipment=2",
      "worker"
    );
    expect(
      p.ok &&
      p.kind === "combined_pair" &&
      p.workerId === 1 &&
      p.equipmentId === 2
    ).toBe(true);
  });

  test("combined mode bare digit uses combinedNumericAs", () => {
    const w = parseSupervisorQrText("55", "combined", {
      combinedNumericAs: "worker",
    });
    expect(w.ok && w.kind === "worker" && w.id === 55).toBe(true);
    const e = parseSupervisorQrText("66", "combined", {
      combinedNumericAs: "equipment",
    });
    expect(e.ok && e.kind === "equipment" && e.id === 66).toBe(true);
  });
});

describe("preUseSignoffRedirectPath", () => {
  test("returns combined-results when both present", () => {
    expect(
      preUseSignoffRedirectPath({ workerId: 1, equipmentId: 2 })
    ).toBe("/supervisor/combined-results?worker=1&equipment=2");
  });

  test("falls back when only one id", () => {
    expect(
      preUseSignoffRedirectPath({ workerId: 3, equipmentId: null })
    ).toBe("/supervisor/worker/3");
    const equipmentPath = preUseSignoffRedirectPath({
      workerId: null,
      equipmentId: 9,
    });
    expect(equipmentPath).toBe("/supervisor/equipment/9");
    expect(equipmentPath.includes("/admin/")).toBe(false);
  });
});
