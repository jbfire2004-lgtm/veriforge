import { redirect } from "next/navigation";

/** Legacy social feed URL — community content lives on Home and Vera Hub. */
export default function SocialRedirectPage() {
  redirect("/home");
}
