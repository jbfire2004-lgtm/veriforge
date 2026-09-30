import { VeraWorkerProfile } from "@/components/vera-core-ui";

type Props = { params: Promise<{ id: string }> };

export default async function CoreWorkerProfilePage({ params }: Props) {
  const { id } = await params;
  const workerId = Number(id);

  return <VeraWorkerProfile workerId={workerId} />;
}
