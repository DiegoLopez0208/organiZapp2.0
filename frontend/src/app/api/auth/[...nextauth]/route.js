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
        
          const res = await fetch( `${process.env.NEXT_PUBLIC_BASE_URL}api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });
        
          if (!res.ok) {
            const errorText = await res.text();
            console.error("Login failed:", errorText);
            throw new Error("Invalid credentials");
          }
        
          const logindata = await res.json();
        
          if (!logindata.token) {
            console.error("No token received from backend");
            throw new Error("Authentication failed: No token provided");
          }
        
          console.log("Token recibido:", logindata.token);
        
          return {
            id: logindata.id?.toString() || "1",
            name: logindata.username || credentials.username,
            email: logindata.email || `${credentials.username}@example.com`,
            image: logindata.image || defaultAvatar,
            accessToken: logindata.token, // ✅ Usa el token del backend
          };
        } catch (error) {
          console.error("Authentication error:", error.message);
          return null;
        }
        
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 
