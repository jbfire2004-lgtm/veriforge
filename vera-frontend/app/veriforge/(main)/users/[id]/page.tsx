import Link from "next/link";
import { VeriForgeButton, VeriForgeContentBlock, VeriForgeInfoCard } from "@/components/veriforge";

export default async function VeriForgeUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-[var(--vf-spacing-md)]">
      <VeriForgeContentBlock title={`User Detail / ${id}`} description="Identity + verification profile view.">
        <div className="grid gap-[var(--vf-spacing-md)] md:grid-cols-2">
          <VeriForgeInfoCard title="Role Assignment" detail="Supervisor with forge-line override authority." />
          <VeriForgeInfoCard title="Verification State" detail="All critical checks signed in the current cycle." />
        </div>
        <div className="mt-[var(--vf-spacing-md)]">
          <Link href={`/veriforge/users/${id}/edit`}>
            <VeriForgeButton>Edit User</VeriForgeButton>
          </Link>
        </div>
      </VeriForgeContentBlock>
    </div>
  );
}

