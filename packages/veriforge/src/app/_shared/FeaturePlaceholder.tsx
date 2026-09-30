export type TenantKind = "organization" | "hiring_client" | "developer" | "public";

export function FeaturePlaceholder(props: {
  tenant: TenantKind;
  title: string;
  description: string;
  liveHref: string;
}) {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: 720 }}>
      <p style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {props.tenant} · DDD module
      </p>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      <p>
        Live route:{" "}
        <a href={props.liveHref}>{props.liveHref}</a>
      </p>
    </main>
  );
}
