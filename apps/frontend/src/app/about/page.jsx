"use client";

import { useTheme } from "next-themes";
import {
  DollarSign,
  Phone,
  LayoutGrid,
  Lightbulb,
  Moon,
  Sun,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: DollarSign,
    description:
      "Queremos que las personas estén organizadas y mejoren su calidad de tiempo.",
  },
  {
    icon: Phone,
    description: "Puedes contactarnos a través de la pestaña de Contacto.",
  },
  {
    icon: LayoutGrid,
    description:
      "Tenemos una sección para escribir en un chat grupal y también un calendario para anotar tus necesidades.",
  },
  {
    icon: Lightbulb,
    description:
      "No buscamos innovar, sino mejorar las cosas básicas necesarias para poder organizarse mejor.",
  },
];

export default function About() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold p-10 text-green-500 mb-6 text-center">
          OrganiZapp
        </h1>
        <p className="text-xl mb-12 text-center">
          La clave del éxito está en la organización.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gray-50 dark:bg-gray-800 border-green-500"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
