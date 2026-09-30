import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
      "@vera/workflow-sim": path.join(root, "../packages/vera-workflow-sim/src/index.ts"),
      "@vera/intelligence": path.join(root, "../packages/vera-intelligence/src/index.ts"),
      "@vera/vision": path.join(root, "../packages/vera-vision/src/index.ts"),
      "@vera/digital-twin": path.join(root, "../packages/vera-digital-twin/src/index.ts"),
      "@vera/autonomous-safety": path.join(root, "../packages/vera-autonomous-safety/src/index.ts"),
      "@vera/predictive-scheduling": path.join(root, "../packages/vera-predictive-scheduling/src/index.ts"),
      "@vera/autonomous-operations": path.join(root, "../packages/vera-autonomous-operations/src/index.ts"),
      "@vera/enterprise-automation": path.join(root, "../packages/vera-enterprise-automation/src/index.ts"),
      "@vera/command-center": path.join(root, "../packages/vera-command-center/src/index.ts"),
      "@vera/enterprise-brain": path.join(root, "../packages/vera-enterprise-brain/src/index.ts"),
      "@vera/global-network": path.join(root, "../packages/vera-global-network/src/index.ts"),
      "@vera/industry-ecosystem": path.join(root, "../packages/vera-industry-ecosystem/src/index.ts"),
      "@vera/marketplace": path.join(root, "../packages/vera-marketplace/src/index.ts"),
      "@vera/interplanetary": path.join(root, "../packages/vera-interplanetary/src/index.ts"),
      "@vera/interstellar": path.join(root, "../packages/vera-interstellar/src/index.ts"),
      "@vera/civilization": path.join(root, "../packages/vera-civilization/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.smoke.test.ts"],
  },
});
