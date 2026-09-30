import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  // Clear the session cookie
  cookieStore.set("next-auth.session-token", "", { expires: new Date(0) });
  cookieStore.set("next-auth.callback-url", "", { expires: new Date(0) });
  cookieStore.set("__Secure-next-auth.session-token", "", { expires: new Date(0) });

  return NextResponse.redirect(new URL("/auth/login", req.url));
}
