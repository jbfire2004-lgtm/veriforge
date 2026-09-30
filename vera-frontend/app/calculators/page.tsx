import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { CalculatorsHubView } from "@/components/calculators/CalculatorsHubView";

export const metadata = {
  title: "Safety Calculators — VERA Hub",
  description:
    "Rigging, fall clearance, crane radius, and confined space ventilation calculators.",
};

export default async function CalculatorsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/calculators");
  }

  return <CalculatorsHubView />;
}
