import { ThemeProvider } from "next-themes"; 
import { SessionProvider } from "next-auth/react"; 

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}