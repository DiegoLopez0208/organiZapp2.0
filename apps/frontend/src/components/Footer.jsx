"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

import { Button } from "@/components/ui/button";

import { LogoOrganiZapp } from "@/app/lib/image";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="container mx-auto  md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src={LogoOrganiZapp}
              width={200}
              height={200}
              quality={100}
              alt="OrganiZapp Logo"
              className="w-12 h-12 md:w-16 md:h-16"
            />
            <span className="text-2xl font-semibold text-green-500">
              OrganiZapp
            </span>
          </Link>
          <nav>
            <ul className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm font-medium text-gray-300">
              <li>
                <Link
                  href="/about"
                  className="hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/contact/socials/"
                  className="hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                >
                  Nuestro Equipo
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <hr className="my-8 border-gray-700" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400 text-center md:text-left">
            © 2025 OrganiZapp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
