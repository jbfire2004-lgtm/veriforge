import SifHecaDetailPage from "@/src/pages/pm/sif-heca/detail";

export default function SifHecaDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  return <SifHecaDetailPage id={params.id} />;
}
