import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { PublicHomeStatic } from "@/components/home/PublicHomeStatic";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/welcome");
  }
  return <PublicHomeStatic />;
}
