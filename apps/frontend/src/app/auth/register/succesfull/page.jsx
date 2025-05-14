"use client"

import { CheckCircle } from "lucide-react"


import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"


export default function RegisterSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="mx-auto w-full max-w-md text-center">
        <CardHeader className="pb-6 pt-8">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">¡Registro exitoso!</h1>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <p className="text-gray-700">Gracias por registrarte en nuestra plataforma.</p>
          <p className="text-gray-700">
            Ahora puedes iniciar sesión y disfrutar de todas las funcionalidades disponibles.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">

        </CardFooter>
      </Card>
    </div>
  )
}
