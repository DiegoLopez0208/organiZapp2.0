"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Linkedin, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendMail = async (e) => {
    e.preventDefault();
    setError(null);

    if (Object.values(formData).some((field) => field === "")) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await fetch("/api/sendEmail/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el mensaje");
      }

      router.push("/contact/succesfull");
    } catch (err) {
      setError(
        "Ocurrió un error al enviar el mensaje. Por favor, inténtalo de nuevo.",
      );
    }
  };

  return (
    <div className="min-h-screen text-black bg-white dark:bg-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center p-10 text-green-500 mb-12">
          Contacto
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="dark:bg-gray-800 border-green-500">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-green-400">
                Nuestras Redes Sociales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href="/contact/socials/"
                className="flex items-center  space-x-3 dark:text-white text-gray-800 hover:text-white hover:bg-green-600 p-3 rounded-md transition duration-200"
              >
                <Github className="h-6 w-6" />
                <span>Github</span>
              </Link>
              <Link
                href="/contact/socials/"
                className="flex items-center space-x-3 dark:text-white text-gray-800 hover:text-white hover:bg-green-600 p-3 rounded-md transition duration-200"
              >
                <Linkedin className="h-6 w-6" />
                <span>LinkedIn</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800  border-green-500">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-green-400">
                Enviar Mensaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendMail} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 border-gray-600  text-black dark:text-gray-100 focus:border-green-500"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 border-gray-600  text-black dark:text-gray-100 focus:border-green-500"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Asunto"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 border-gray-600  text-black dark:text-gray-100 focus:border-green-500"
                  />
                </div>
                <div>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Mensaje"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 border-gray-600  text-black dark:text-gray-100 focus:border-green-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Send className="mr-2 h-4 w-4" /> Enviar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
