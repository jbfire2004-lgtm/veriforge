import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { FeedbackBoard } from "@/components/feedback/FeedbackBoard";

export const metadata = {
  title: "Feedback & suggestions — VERA",
  description: "Submit and vote on product ideas for Vera Safety Intelligence.",
};

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/feedback");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-[#f4f7fa] to-[#E4F3F2]/50">
      <FeedbackBoard />
    </main>
  );
}
