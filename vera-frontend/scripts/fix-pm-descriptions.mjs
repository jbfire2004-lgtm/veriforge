import fs from "fs";
import path from "path";

const fixes = [
  [
    "src/pages/pm/safety-suite/index.tsx",
    /<VeraPageLayout[\s\S]*?description="[\s\S]*?"\s*>/,
    `<VeraPageLayout
      title="Vera Safety Suite"
      description={\`JHA, FLHA, SIF, HECA, energy wheel, libraries, workflows, and readiness — project #\${projectId}\`}
    >`,
  ],
  [
    "src/pages/pm/project-management/dashboard.tsx",
    /<VeraPageLayout[\s\S]*?>\s*\n/,
    `<VeraPageLayout
      title="Project management"
      description={
        <>
          {String(project?.name ?? \`Project #\${projectId}\`)}
          {project?.code ? \` · \${String(project.code)}\` : ""}
        </>
      }
    >
`,
  ],
  [
    "src/pages/pm/worker-safety-profile/dashboard.tsx",
    /<VeraPageLayout[\s\S]*?>\s*\n/,
    `<VeraPageLayout
      title="Worker safety profile"
      description={
        <>
          {String(identity?.name ?? \`Worker #\${workerId}\`)}
          {projectId ? \` · project #\${projectId}\` : ""}
        </>
      }
    >
`,
  ],
  [
    "src/pages/pm/unified-hazard-control/dashboard.tsx",
    /<VeraPageLayout[\s\S]*?>\s*\n/,
    `<VeraPageLayout
      title="Unified hazard & control"
      description={\`Company #\${companyId}\${projectId ? \` · Project #\${projectId}\` : ""}\`}
    >
`,
  ],
  [
    "src/pages/pm/unified-corrective-action/dashboard.tsx",
    /<VeraPageLayout[\s\S]*?>\s*\n/,
    `<VeraPageLayout
      title="Unified corrective actions"
      description={\`Company #\${companyId}\${projectId ? \` · Project #\${projectId}\` : ""}\`}
    >
`,
  ],
];

for (const [file, re, replacement] of fixes) {
  let src = fs.readFileSync(file, "utf8");
  src = src.replace(re, replacement);
  fs.writeFileSync(file, src);
  console.log("ok", file);
}

const templateFixes = [
  ["src/pages/pm/incidents/dashboard.tsx", "Intake wizard, RCA, SIF/HECA, CAIL — project #", "projectId"],
  ["src/pages/pm/inspections/dashboard.tsx", "Templates, field execution, deficiencies, and CAIL — project #", "projectId"],
  ["src/pages/pm/corrective-actions/dashboard.tsx", "Unified CAPA on CAIL — assignment, escalation, verification — project #", "projectId"],
  ["src/pages/pm/attachments-media/dashboard.tsx", "Unified uploads, thumbnails, annotations, and offline sync — project #", "projectId"],
];

for (const [file, prefix, varName] of templateFixes) {
  let src = fs.readFileSync(file, "utf8");
  src = src.replace(
    new RegExp(`description="${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\{${varName}\\}"`, "g"),
    `description={\`${prefix}\${${varName}}\`}`,
  );
  fs.writeFileSync(file, src);
  console.log("tpl", file);
}

const multiLine = [
  ["src/pages/pm/site-access-control/dashboard.tsx", "Unified validation across training, JHA, CAPA, equipment, SDS, emergency — project #", "projectId"],
  ["src/pages/pm/safety-stations/dashboard.tsx", "Registration, heartbeat monitoring, worker/equipment validation, muster, offline sync — project #", "projectId"],
  ["src/pages/pm/offline-mode/dashboard.tsx", "Local-first IndexedDB cache, sync queue, delta updates, and conflict resolution — project #", "projectId"],
  ["src/pages/pm/project-safety-context/dashboard.tsx", "Safety profile, hazard & control libraries, enforcement, versioning — project #", "projectId"],
  ["src/pages/pm/equipment-safety/dashboard.tsx", "Profiles, certifications, inspections, LOTO, failures, and CAIL risk scoring — project #", "projectId"],
  ["src/pages/pm/emergency-response/dashboard.tsx", "Plans, muster, evacuation, notifications, and CAIL — site #", "siteId", ", project #", "projectId"],
  ["src/pages/pm/documents/dashboard.tsx", "SDS library, chemical inventory, policies, acknowledgments, and CAIL insights — project #", "projectId"],
  ["src/pages/pm/company-safety-context/dashboard.tsx", "Corporate profile, master hazard/control libraries, training matrix, policies, SDS, emergency plans — company #", "companyId"],
];

for (const row of multiLine) {
  const [file, ...parts] = row;
  let src = fs.readFileSync(file, "utf8");
  const re = /<VeraPageLayout[\s\S]*?>\s*\n/;
  let desc;
  if (parts.length === 2) {
    desc = `description={\`${parts[0]}\${${parts[1]}}\`}`;
  } else {
    desc = `description={\`${parts[0]}\${${parts[1]}}${parts[2]}\${${parts[3]}}\`}`;
  }
  const titleMatch = src.match(/title="([^"]+)"/);
  const title = titleMatch?.[1] ?? "Page";
  src = src.replace(
    re,
    `<VeraPageLayout\n      title="${title}"\n      ${desc}\n    >\n`,
  );
  fs.writeFileSync(file, src);
  console.log("multi", file);
}

// Fix HTML entities in titles
for (const file of ["src/pages/pm/unified-hazard-control/dashboard.tsx", "src/pages/pm/attachments-media/dashboard.tsx"]) {
  let src = fs.readFileSync(file, "utf8");
  src = src.replace(/&amp;/g, "&");
  fs.writeFileSync(file, src);
}

console.log("done");
