import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { refreshSession } from "@/lib/api/phase-1-auth";
import { unwrapApiPayload } from "@/lib/api-fetch";
import { roleFromAccessToken } from "@/lib/session-role";
import { resolveServerApiBaseUrl } from "@/lib/dev-ports";

const apiBase = resolveServerApiBaseUrl();

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    username?: string | null;
    email: string;
    role: string;
    companyId?: number | null;
    companyName?: string | null;
    trainingProviderId?: number | null;
    instructorId?: number | null;
  };
};

type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  companyId?: number | null;
  companyName?: string | null;
  trainingProviderId?: number | null;
  instructorId?: number | null;
  accessToken?: string;
  refreshToken?: string;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        let res: Response;
        try {
          res = await fetch(`${apiBase}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            signal: AbortSignal.timeout(12_000),
          });
        } catch {
          throw new Error(
            "Cannot reach the VERA API. Start the backend on port 3001 (npm run dev:parallel).",
          );
        }

        const raw = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            raw && typeof raw === "object" && "message" in raw
              ? String((raw as { message: unknown }).message)
              : "Invalid email or password";
          throw new Error(msg);
        }

        const data = unwrapApiPayload<LoginResponse>(raw);
        const u = data?.user;
        if (!u?.id || !u.email) return null;

        return {
          id: String(u.id),
          name: u.username?.trim() ? u.username : u.email,
          email: u.email,
          role: u.role,
          companyId: u.companyId ?? null,
          companyName: u.companyName ?? null,
          trainingProviderId: u.trainingProviderId ?? null,
          instructorId: u.instructorId ?? null,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser;
        token.role = u.role;
        token.companyId = u.companyId ?? null;
        token.companyName = u.companyName ?? null;
        token.trainingProviderId = u.trainingProviderId ?? null;
        token.instructorId = u.instructorId ?? null;
        if (u.accessToken) token.accessToken = u.accessToken;
        if (u.refreshToken) token.refreshToken = u.refreshToken;
        token.accessTokenExpires = Date.now() + 55 * 60 * 1000;
        return token;
      }

      const expires = token.accessTokenExpires as number | undefined;
      const hasAccessToken =
        typeof token.accessToken === "string" && token.accessToken.length > 0;

      // Reuse a valid access token; legacy cookies may lack accessTokenExpires.
      if (hasAccessToken && (!expires || Date.now() < expires)) {
        return token;
      }

      if (typeof token.refreshToken === "string") {
        try {
          const refreshed = await refreshSession(token.refreshToken);
          if (refreshed.accessToken) {
            token.accessToken = refreshed.accessToken;
          }
          if (refreshed.refreshToken) {
            token.refreshToken = refreshed.refreshToken;
          }
          if (refreshed.user?.role) {
            token.role = refreshed.user.role;
          }
          if (refreshed.user?.companyId != null) {
            token.companyId = refreshed.user.companyId;
          }
          if (refreshed.user?.companyName != null) {
            token.companyName = refreshed.user.companyName;
          }
          token.accessTokenExpires = Date.now() + 55 * 60 * 1000;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const transient =
            /Cannot reach|ECONNREFUSED|ETIMEDOUT|fetch failed|network|AbortError|timeout/i.test(
              msg,
            );
          // Keep refreshToken on transient API outages so Inspections can recover
          // once Nest is back without forcing a full re-login.
          if (transient) {
            return token;
          }
          // Only clear credentials when the access token is missing or known expired.
          if (!hasAccessToken || (expires != null && Date.now() >= expires)) {
            token.accessToken = undefined;
            token.refreshToken = undefined;
          }
        }
      }

      if (
        !token.role &&
        typeof token.accessToken === "string"
      ) {
        const decoded = roleFromAccessToken(token.accessToken);
        if (decoded) token.role = decoded;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        let role =
          typeof token.role === "string" && token.role.length > 0
            ? token.role
            : undefined;
        if (
          !role &&
          typeof token.accessToken === "string"
        ) {
          role = roleFromAccessToken(token.accessToken) ?? undefined;
        }
        session.user.role = role;
        session.user.companyId = token.companyId as number | null | undefined;
        session.user.companyName = token.companyName as string | null | undefined;
        session.user.trainingProviderId = token.trainingProviderId as
          | number
          | null
          | undefined;
        session.user.instructorId = token.instructorId as number | null | undefined;
      }
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
  },
};
