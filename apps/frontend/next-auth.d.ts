import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    user: DefaultSession["user"] & {
      id?: string;
    };
  }

  interface User extends DefaultUser {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    id?: string;
    email?: string;
    name?: string;
    image?: string;
  }
}
