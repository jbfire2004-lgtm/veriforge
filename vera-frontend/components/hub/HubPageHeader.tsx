import { WorkspaceHero } from "@/components/theme/workspace";

type Props = {
  title: string;
  description?: string;
  badge?: string;
};

/** Sub-route intro under hub tabs (Activity, Network, etc.). */
export function HubPageHeader({ title, description, badge }: Props) {
  return (
    <WorkspaceHero
      title={title}
      description={description}
      badges={badge ? [{ label: badge, tone: "teal" }] : undefined}
      className="mb-2"
    />
  );
}
