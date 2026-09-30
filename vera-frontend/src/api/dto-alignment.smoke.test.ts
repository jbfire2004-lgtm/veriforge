import { describe, expect, test } from "vitest";
import {
  SITE_CREATE_EXAMPLE_PAYLOAD,
} from "@/src/api/sites";
import { SITE_CONTACT_CREATE_EXAMPLE } from "@/src/api/site-contacts";
import { siteCreateSchema } from "@/src/lib/site.schema";
import { siteContactCreateSchema } from "@/src/lib/site-contact.schema";

describe("frontend DTO alignment smoke", () => {
  test("site create example matches shared frontend schema", () => {
    const parsed = siteCreateSchema.safeParse(SITE_CREATE_EXAMPLE_PAYLOAD);
    expect(parsed.success).toBe(true);
  });

  test("site-contact create example matches shared frontend schema", () => {
    const parsed = siteContactCreateSchema.safeParse(SITE_CONTACT_CREATE_EXAMPLE);
    expect(parsed.success).toBe(true);
  });
});
