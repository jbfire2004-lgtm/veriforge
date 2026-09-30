import { filterPublicHomePayload } from "@/lib/home/public-hub-snapshot";
import { emptyHomepagePayload } from "@/lib/hub/empty-homepage";

/** Instant fallback for `/home` — no API or auth required. */
export const staticPublicHomeSnapshot = filterPublicHomePayload(
  emptyHomepagePayload(null),
);
