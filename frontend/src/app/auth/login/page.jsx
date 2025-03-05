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

export default function Login() {
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) router.push("/");
  }, [session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const signInResponse = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (signInResponse && !signInResponse.error) {
      router.push("/");
    } else {
      setError("¡Tu nombre de usuario o contraseña es incorrecto!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-green-500 text-center">
          Iniciar sesión
        </h2>

        <div className="mt-4">
          <p className="text-sm font-medium text-center text-gray-400">
            Iniciar sesión con
          </p>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => signIn("facebook", { callbackUrl: "/" })}
            >
              <Facebook className="w-5 h-5 text-blue-500" />
              <span className="sr-only ">Facebook</span>
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
              <span className="sr-only ">Google</span>
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

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 text-white"
              />
            </div>
            <div>
              <Label className="text-white" htmlFor="password">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 text-white"
              />
            </div>
            <div>
              <Button type="submit" className="w-full">
                Continuar
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link href="/auth/register">
              <Button variant="link" className="text-green-500">
                ¿No tienes una cuenta? Regístrate aquí
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
