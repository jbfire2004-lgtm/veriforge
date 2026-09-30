import { mergeFormFields } from "../field-merge";

describe("mergeFormFields", () => {
  it("merges non-conflicting client fields", () => {
    const { merged, conflicts } = mergeFormFields(
      { hazards: "fall" },
      { location: "site A" },
    );
    expect(merged).toEqual({ location: "site A", hazards: "fall" });
    expect(conflicts).toHaveLength(0);
  });

  it("flags conflicts when server is newer", () => {
    const { conflicts } = mergeFormFields(
      { hazards: "fall" },
      { hazards: "struck-by" },
      "2026-05-20T12:00:00Z",
      "2026-05-19T12:00:00Z",
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].field).toBe("hazards");
  });
});
