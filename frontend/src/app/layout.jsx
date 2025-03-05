import Providers from "./providers/providers"; // Asegúrate de que la ruta sea correcta
import "./globals.css";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
