import Providers from "./providers/providers";
import "./globals.css";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NavBar />

          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
