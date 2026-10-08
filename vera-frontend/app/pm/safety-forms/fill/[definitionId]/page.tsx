import SafetyFormFillPage from "@/src/screens/pm/safety-forms/fill";

type Props = {
  params: Promise<{ definitionId: string }>;
  searchParams: Promise<{
    projectId?: string;
    workerId?: string;
    companyId?: string;
  }>;
};

export default async function SafetyFormFillRoute({ params, searchParams }: Props) {
  const { definitionId } = await params;
  const sp = await searchParams;
  const parse = (v?: string) => {
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };

  return (
    <SafetyFormFillPage
      definitionId={definitionId}
      projectId={parse(sp.projectId)}
      workerId={parse(sp.workerId)}
      companyId={parse(sp.companyId)}
    />
  );
}
