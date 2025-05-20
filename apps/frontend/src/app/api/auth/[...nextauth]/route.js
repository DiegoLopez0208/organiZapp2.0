import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import { defaultAvatar } from "@/app/lib/image";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Missing username or password");
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}api/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
            },
          );

          const loginData = await res.json();

          if (!res.ok) {
            throw new Error(loginData.message || "Invalid credentials");
          }

          if (!loginData.token) {
            throw new Error("Authentication failed: No token provided");
          }

          return {
            id: loginData.user?.id || "",
            name: loginData.user?.username || credentials.username,
            email:
              loginData.user?.email || `${credentials.username}@example.com`,
            image: loginData.user?.image || defaultAvatar,
            accessToken: loginData.token,
            refreshToken: loginData.refreshToken,
            provider: "credentials",
          };
        } catch (error) {
          console.error("Authentication error:", error.message);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}api/auth/oauth-login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: profile.email,
                name: profile.name,
                image: profile.picture,
                provider: "google",
              }),
            },
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Google OAuth failed");
          }

          const data = await res.json();

          return {
            id: data.user?.id || profile.sub,
            email: data.user?.email || profile.email,
            name: data.user?.username || profile.name,
            image: data.user?.image || profile.picture,
            accessToken: data.token,
          };
        } catch (error) {
          console.error("Google OAuth error:", error);
          throw error;
        }
      },
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      async profile(profile) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}api/auth/oauth-login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: profile.email,
                name: profile.name,
                image: profile.picture?.data?.url || null,
                provider: "facebook",
              }),
            },
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Facebook OAuth failed");
          }

          const data = await res.json();

          return {
            id: data.user?.id || profile.id,
            email: data.user?.email || profile.email,
            name: data.user?.username || profile.name,
            image: data.user?.image || profile.picture?.data?.url || null,
            accessToken: data.token,
          };
        } catch (error) {
          console.error("Facebook OAuth error:", error);
          throw error;
        }
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      async profile(profile) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}api/auth/oauth-login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: profile.email,
                name: profile.name || profile.login,
                image: profile.avatar_url,
                provider: "github",
              }),
            },
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "GitHub OAuth failed");
          }

          const data = await res.json();

          return {
            id: data.user?.id || profile.id.toString(),
            email: data.user?.email || profile.email,
            name: data.user?.username || profile.name || profile.login,
            image: data.user?.image || profile.avatar_url,
            accessToken: data.token,
          };
        } catch (error) {
          console.error("GitHub OAuth error:", error);
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.provider = user.provider;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.provider = token.provider;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
