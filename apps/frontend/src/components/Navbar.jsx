"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoOrganiZapp } from "@/app/lib/image";

export default function NavBar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const closeMenu = () => setIsMenuOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  const handleNavigation = (href) => {
    if (status === "unauthenticated" && (href === "/chat" || href === "/calendar")) {
      router.push("/auth/login");
      return;
    }
    router.push(href);
  };

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Chat", href: "/chat" },
    { name: "Calendario", href: "/calendar" },
    { name: "Contacto", href: "/contact" },
  ];

  return (
    <nav className="bg-green-500 dark:bg-green-600 shadow-md z-50 fixed top-0 left-0 right-0 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={LogoOrganiZapp || "/placeholder.svg"}
              alt="OrganiZapp Logo"
              width={200}
              height={200}
              quality={100}
              className="w-10 h-10 md:w-12 md:h-12"
            />
            <span className="text-xl font-semibold">
              <span className="text-white">Organi</span>
              <span className="text-yellow-100">Zapp</span>
            </span>
          </Link>

          <div className="hidden sm:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="text-white text-base font-medium hover:text-gray-100 hover:border-b-2 border-transparent hover:border-white transition-all duration-200"
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-green-400/20"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center text-white hover:bg-green-400/20"
                  >
                    {session.user.image?.includes("dicebear.com") ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "Usuario"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <Image
                        src={session.user.image || "/placeholder.svg"}
                        alt={session.user.name || "Usuario"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <DropdownMenuItem className="cursor-default">
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {session.user.name}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => signOut()}
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => signIn()}
                  className="text-white hover:bg-green-400/20"
                >
                  Iniciar sesión
                </Button>
                <Link href="/auth/register">
                  <Button className="bg-white text-green-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex sm:hidden items-center space-x-2">
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-green-400/20"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-green-400/20"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden bg-green-500 dark:bg-green-600 border-t border-green-400/20 absolute w-full z-50">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavigation(item.href);
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 text-white hover:bg-green-400/20"
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="pt-2 pb-3 border-t border-green-400/20">
            {session?.user ? (
              <>
                <div className="flex items-center px-4 py-2">
                  {session.user.image?.includes("dicebear.com") ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Usuario"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <Image
                      src={session.user.image || "/placeholder.svg"}
                      alt={session.user.name || "Usuario"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div className="ml-3">
                    <div className="text-sm font-medium text-white">
                      {session.user.name}
                    </div>
                    <div className="text-xs font-medium text-gray-100">
                      {session.user.email}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="block w-full text-left px-4 py-2 text-white hover:bg-green-400/20"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <div className="px-4 py-2 space-y-1">
                <Button
                  variant="ghost"
                  className="block w-full text-left px-4 py-2 text-white hover:bg-green-400/20"
                  onClick={() => {
                    signIn();
                    setIsMenuOpen(false);
                  }}
                >
                  Iniciar sesión
                </Button>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="block w-full text-left px-4 py-2 bg-white text-green-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
