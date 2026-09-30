import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { SlingAngleCalculator } from "@/components/calculators/SlingAngleCalculator";

export const metadata = {
  title: "Sling Angle / Load Calculator — VERA Hub",
};

export default async function SlingAnglePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/calculators/sling-angle");
  }

  return <SlingAngleCalculator />;
}
