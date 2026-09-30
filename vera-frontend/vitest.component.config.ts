import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
      "@vera/api-contract": path.join(
        root,
        "../packages/vera-api-contract/src/index.ts",
      ),
    },
  },
  test: {
    environment: "jsdom",
    include: ["**/*.component.test.tsx"],
    setupFiles: ["./tests/component-setup.ts"],
  },
});
