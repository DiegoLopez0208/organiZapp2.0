"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, X, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogoOrganiZapp } from "@/app/lib/image";

export default function NavBar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setIsMenuOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Chat", href: "/chat" },
    { name: "Calendario", href: "/calendar" },
    { name: "Contacto", href: "/contact" },
  ];

  return (
    <nav className="bg-green-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={LogoOrganiZapp}
              alt="OrganiZapp Logo"
              width={200}
              height={200}
              quality={100}
              className="w-12 h-12 md:w-16 md:h-16"
            />
            <span className="text-xl font-semibold">
              <span className="text-white">Organi</span>
              <span className="text-yellow-100">Zapp</span>
            </span>
          </Link>

          <div className="hidden sm:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white text-sm font-medium hover:text-gray-200 hover:border-b-2 border-transparent hover:border-white"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            {session?.user ? (
              <DropdownMenu >
                <DropdownMenuTrigger asChild >
                  <Button
                    variant="outline"
                    className="flex items-center text-white "
                  >
                    <Image
                      src={session.user.image || "/placeholder.svg" } 
                      alt={session.user.name || "Usuario"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <ChevronDown className="ml-2 h-4 w-4 text-green-500" />
                  </Button>
                </DropdownMenuTrigger >
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <span className="font-bold text-green-600">
                      {session.user.name}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => signOut()}>
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => signIn()}
                  className="text-white"
                >
                  Iniciar sesión
                </Button>
                 <Link href="/auth/register">
                <Button
                  className="bg-white text-green-500 hover:bg-gray-200"
                >
                  Registrarse
                </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex sm:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-green-600 p-2 rounded-md"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden bg-green-500 border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block pl-3 pr-4 py-2 text-white hover:bg-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {session?.user ? (
              <>
                <div className="flex items-center px-4">
                  <Image
                    src={session.user.image || "/placeholder.svg"}
                    alt={session.user.name || "Usuario"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {session.user.name}
                    </div>
                    <div className="text-sm font-medium text-gray-200">
                      {session.user.email}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="block w-full text-left px-4 py-2 text-white hover:bg-green-600"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="block w-full text-left px-4 py-2 text-white hover:bg-green-600"
                  onClick={() => {
                    signIn();
                    setIsMenuOpen(false);
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  className="block w-full text-left px-4 py-2 text-white hover:bg-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
