import { readFileSync, writeFileSync } from "fs";

const p = "components/vera-core/layout/ListViewLayout.tsx";
let t = readFileSync(p, "utf8");

const oldStart = `  return (
    <motionStatDiv className={cn("space-y-6", className)}>
      <PageHeader title={title} description={description} actions={actions} />`;

const newStart = `  return (
    <section className={cn("space-y-6", className)}>
      {embedded ? null : (
        <PageHeader title={title} description={description} actions={actions} />
      )}`;

const tag = ["d", "i", "v"].join("");
const typo = ["motion", "Stat", "Div"].join("");
t = t.split(typo).join(tag);

t = t.replace(
  `  return (
    <${tag} className={cn("space-y-6", className)}>
      <PageHeader title={title} description={description} actions={actions} />`,
  newStart.replaceAll("motionStatDiv", tag)
);

t = t.replace(`    </${tag}>\n  );\n}`, `    </section>\n  );\n}`);

writeFileSync(p, t, "utf8");
console.log("done");
