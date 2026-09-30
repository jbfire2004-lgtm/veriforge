import { describe, expect, it } from "vitest";

import {

  FIT_TEST_METHODS,

  FIT_TEST_TYPES,

  fitTestStatusTone,

  formatFitTestDate,

} from "@/lib/fit-tests";



describe("fit test frontend helpers", () => {

  it("exposes test type and method options", () => {

    expect(FIT_TEST_TYPES).toContain("N95");

    expect(FIT_TEST_METHODS).toContain("Qualitative");

  });



  it("maps fit test status labels to tones", () => {

    expect(fitTestStatusTone("PASS")).toBe("success");

    expect(fitTestStatusTone("EXPIRED")).toBe("danger");

    expect(fitTestStatusTone("CONDITIONAL")).toBe("warning");

  });



  it("formats fit test dates", () => {

    expect(formatFitTestDate("2026-06-01T12:00:00.000Z")).toBeTruthy();

    expect(formatFitTestDate("invalid")).toBeNull();

  });

});


