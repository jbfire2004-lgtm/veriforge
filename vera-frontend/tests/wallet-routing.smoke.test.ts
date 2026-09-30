import { describe, expect, it } from "vitest";
import {
  equipmentDestination,
  equipmentVerifyPath,
  extractEquipmentIdFromScan,
  extractWorkerIdFromScan,
  parseQrScanText,
  routeScanTarget,
  workerDestination,
  workerStaffWalletPath,
  workerVerifyPath,
  workerVerifyPathByToken,
} from "@/lib/wallet-routing";

describe("wallet-routing", () => {
  it("routes workers by audience", () => {
    expect(workerDestination(42, "public")).toBe("/verify/42");
    expect(workerDestination(42, "staff")).toBe("/wallet/42");
    expect(workerDestination(42, "supervisor")).toBe("/supervisor/worker/42");
  });

  it("routes equipment to public verify for field users", () => {
    expect(equipmentDestination(9, "public")).toBe("/verify/equipment?id=9");
    expect(equipmentDestination(9, "staff")).toBe("/equipment/9/wallet");
    expect(equipmentDestination(9, "supervisor")).toBe("/supervisor/equipment/9");
  });

  it("parses canonical worker verify URLs", () => {
    expect(extractWorkerIdFromScan("https://app.vera/verify/42")).toBe(42);
    expect(extractWorkerIdFromScan("https://app.vera/scan/worker/42")).toBe(42);
    expect(extractWorkerIdFromScan("/wallet/7")).toBe(7);
  });

  it("parses token verify URLs", () => {
    expect(parseQrScanText("/verify/t/w-abc123def456")?.kind).toBe("worker_token");
    expect(parseQrScanText("/verify/t/e-abc123def456")?.kind).toBe("equipment_token");
  });

  it("routes token scans to public verify paths", () => {
    const worker = routeScanTarget("https://app/verify/t/w-token123", "public");
    expect(worker?.href).toBe(workerVerifyPathByToken("w-token123"));
    const equipment = routeScanTarget("https://app/verify/t/e-token456", "public");
    expect(equipment?.href).toContain("/verify/t/e-token456");
    expect(equipment?.href.includes("/admin/")).toBe(false);
  });

  it("routes wallet deep-links to public verify on public scanner", () => {
    const routed = routeScanTarget("https://app/wallet/12", "public");
    expect(routed?.href).toBe(workerVerifyPath(12));
  });

  it("routes wallet deep-links to staff hub for staff audience", () => {
    const routed = routeScanTarget("https://app/wallet/12", "staff");
    expect(routed?.href).toBe(workerStaffWalletPath(12));
  });

  it("parses equipment verify URLs and JSON envelopes", () => {
    expect(extractEquipmentIdFromScan("https://app.vera/verify/equipment?id=9")).toBe(9);
    expect(extractEquipmentIdFromScan('{"type":"equipment","id":15}')).toBe(15);
    expect(extractEquipmentIdFromScan("https://app.vera/scan/equipment/15")).toBe(15);
  });

  it("does not treat verify/equipment as worker id", () => {
    expect(parseQrScanText("/verify/equipment?id=3")?.kind).toBe("equipment");
    expect(extractWorkerIdFromScan("/verify/equipment?id=3")).toBeNull();
  });

  it("never routes equipment scans to admin paths", () => {
    for (const audience of ["public", "staff", "supervisor"] as const) {
      const target = equipmentDestination(5, audience);
      expect(target.includes("/admin/")).toBe(false);
    }
    const json = routeScanTarget('{"type":"equipment","id":5}', "public");
    expect(json?.href).toBe(equipmentVerifyPath(5));
    expect(json?.href.includes("/admin/")).toBe(false);
  });

  it("exposes staff wallet paths separately from verify", () => {
    expect(workerStaffWalletPath(1)).toBe("/wallet/1");
    expect(workerVerifyPath(1)).toBe("/verify/1");
    expect(workerStaffWalletPath(1)).not.toBe(workerVerifyPath(1));
  });
});
