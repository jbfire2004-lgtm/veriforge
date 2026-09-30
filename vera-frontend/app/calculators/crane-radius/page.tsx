import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { CraneRadiusCalculator } from "@/components/calculators/CraneRadiusCalculator";

export const metadata = {
  title: "Crane Radius Estimator — VERA Hub",
};

export default async function CraneRadiusPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/calculators/crane-radius");
  }

  return <CraneRadiusCalculator />;
}
