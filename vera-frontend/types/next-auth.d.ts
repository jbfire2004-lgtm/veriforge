import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: DefaultSession["user"] & {
      role?: string;
      companyId?: number | null;
      companyName?: string | null;
      trainingProviderId?: number | null;
      instructorId?: number | null;
    };
  }

  interface User {
    role?: string;
    companyId?: number | null;
    companyName?: string | null;
    accessToken?: string;
    trainingProviderId?: number | null;
    instructorId?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    companyId?: number | null;
    companyName?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    trainingProviderId?: number | null;
    instructorId?: number | null;
  }
}
