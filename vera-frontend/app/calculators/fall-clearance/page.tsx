import { redirect } from "next/navigation";

export const metadata = {
  title: "Fall Clearance — redirected",
};

/** Legacy Hub calculator → PM Work at Heights clearance worksheet. */
export default function FallClearanceRedirectPage() {
  redirect("/pm/work-at-heights/clearance");
}
