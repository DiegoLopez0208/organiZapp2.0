"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Facebook, Github, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  });
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const registerAuth = async (e) => {
    e.preventDefault();
    setError(null);

    if (Object.values(formData).some((field) => field === "")) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const emailResponse = await fetch("/api/sendEmail/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!emailResponse.ok)
        throw new Error("Error al enviar el correo de registro");

      const registerResponse = await fetch(
        `${process.env.BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!registerResponse.ok) throw new Error("Error en el registro");

      router.push("/auth/register/successful");
    } catch (err) {
      setError(
        "Ocurrió un error durante el registro. Por favor, inténtalo de nuevo."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-green-500 text-center">
          Crear una cuenta
        </h2>

        <div className="mt-4">
          <p className="text-sm font-medium text-center text-gray-400">
            Registrarse con
          </p>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => signIn("facebook", { callbackUrl: "/" })}
            >
              <Facebook className="w-5 h-5 text-blue-500" />
              <span className="sr-only">Facebook</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => signIn("github", { callbackUrl: "/" })}
            >
              <Github className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <Mail className="w-5 h-5 text-red-500" />
              <span className="sr-only">Google</span>
            </Button>
          </div>

          <div className="relative mt-6">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-400 bg-gray-800">
                O continuar con
              </span>
            </div>
          </div>

          <form onSubmit={registerAuth} className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label className="text-white" htmlFor="username">
                Nombre de usuario
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 text-white"
              />
            </div>
            <div>
              <Label className="text-white" htmlFor="email">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 text-white "
              />
            </div>
            <div>
              <Label className="text-white" htmlFor="birthDate">
                Fecha de nacimiento
              </Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                value={formData.birthDate}
                onChange={handleInputChange}
                className="mt-1 text-white "
              />
            </div>
            <div>
              <Label className="text-white" htmlFor="password">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 text-white"
              />
            </div>
            <div>
              <Label className="text-white" htmlFor="confirmPassword">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 text-white "
              />
            </div>
            <div>
              <Button type="submit" className="w-full">
                Registrarse
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link href="/auth/login">
              <Button variant="link" className="text-green-500">
                ¿Ya tienes una cuenta? Inicia sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
