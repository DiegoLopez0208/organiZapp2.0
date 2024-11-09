import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function SuccessfulRegistration() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 text-gray-100">
        <CardContent className="pt-6 text-center">
          <div className="rounded-full bg-green-900 h-24 w-24 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="text-green-500 h-16 w-16" />
          </div>
          <h1 className="text-green-500 text-3xl font-bold mb-4">¡Éxito!</h1>
          <p className="text-gray-300 text-lg">
            ¡Mail Recibido!
            <br />
          Nos contactaremos lo antes posible con usted!
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" passHref>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Volver al inicio
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}