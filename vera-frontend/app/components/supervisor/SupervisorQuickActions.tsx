import Link from "next/link";

const industrialBtn =
  "rounded-[3px] border p-4 text-center font-semibold shadow-none transition-[background-color,transform] duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]";

export function SupervisorQuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link
        href="/supervisor/scan"
        className={`${industrialBtn} border-[#174F86] bg-[#1E6FB8] text-[#F4F6F8] hover:bg-[#1A63A6]`}
      >
        Scan QR Code
      </Link>

      <Link
        href="/supervisor/worker-lookup"
        className={`${industrialBtn} border-[#1F2328] bg-[#2A2E33] text-[#F4F6F8] hover:bg-[#343940]`}
      >
        View Workers
      </Link>

      <Link
        href="/supervisor/equipment-lookup"
        className={`${industrialBtn} border-[#2A2E33] bg-[#3B3F45] text-[#F4F6F8] hover:bg-[#454A51]`}
      >
        View Equipment
      </Link>

      <Link
        href="/supervisor/site-access"
        className={`${industrialBtn} border-[#3D8F58] bg-[#4FAF6F] text-[#0F1A12] hover:bg-[#45A064]`}
      >
        Site Access
      </Link>
    </div>
  );
}
