import { VeraPageLayout } from "@/src/components/navigation";

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

/** Standard admin content layout (global + module nav provided by VeraAppShell). */
export function AdminPageLayout({ title, description, actions, children }: Props) {
  return (
    <VeraPageLayout title={title} description={description} actions={actions}>
      <div className="space-y-8">{children}</div>
    </VeraPageLayout>
  );
}
