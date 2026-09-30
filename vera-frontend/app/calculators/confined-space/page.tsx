import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { ConfinedSpaceCalculator } from "@/components/calculators/ConfinedSpaceCalculator";

export const metadata = {
  title: "Confined Space Ventilation Calculator — VERA Hub",
};

export default async function ConfinedSpacePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/calculators/confined-space");
  }

  return <ConfinedSpaceCalculator />;
}
