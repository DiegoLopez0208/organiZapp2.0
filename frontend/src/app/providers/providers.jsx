"use client"; // Esto es opcional, pero puedes dejarlo si prefieres marcar explícitamente este archivo como del lado del cliente.

import { SessionProvider } from "next-auth/react";

export default function Providers({ children, session }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}