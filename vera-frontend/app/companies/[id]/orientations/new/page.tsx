import { VeraPageLayout } from "@/src/components/navigation";
import { OrientationEditor } from "@/components/orientation/veriforge";
import type { OrientationContentMode } from "@/lib/orientation/veriforge-types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function CompanyOrientationNewPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const companyId = parseInt(id, 10);
  const mode = (
    sp.mode === "uploaded" || sp.mode === "hybrid" ? sp.mode : "native"
  ) as OrientationContentMode;

  return (
    <VeraPageLayout title="Create orientation">
      <OrientationEditor
        companyId={companyId}
        mode={mode}
        basePath={`/companies/${companyId}/orientations`}
      />
    </VeraPageLayout>
  );
}
