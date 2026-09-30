import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
/** Re-export for existing `getServerSession(authOptions)` imports from this route. */
export { authOptions };
