import { WorkspaceShell } from "@/src/components/layout/workspace-shell";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell callbackUrl="/projects">{children}</WorkspaceShell>;
}
