import type { ReactNode } from "react";
import { WorkspaceSection } from "@/components/theme/workspace";

type Props = {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/** Hub section wrapper — uses shared workspace section typography. */
export function HubSection({ id, title, description, children, className }: Props) {
  return (
    <WorkspaceSection
      id={id}
      title={title}
      description={description}
      className={className}
    >
      {children}
    </WorkspaceSection>
  );
}
