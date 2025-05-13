"use client"
import Image from "next/image"
import { MessageCircle, Calendar, Users, Clock, Facebook, Github, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { Man, callendary, ChatImage } from "@/app/lib/image"

export default function Home() {
  const FeatureItem = ({ icon: Icon, children }) => (
    <li className="flex items-center space-x-3">
      <Icon className="text-green-500 h-5 w-5" />
      <span className="text-gray-700 dark:text-gray-300">{children}</span>
    </li>
  )

  const TeamMember = ({ name, role, image, links }) => (
    <Card className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6 text-gray-900 dark:text-white text-center">
        <div className="relative w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-green-500">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
        <h4 className="font-semibold text-xl">{name}</h4>
        <p className="text-gray-500 dark:text-gray-400">{role}</p>
        <div className="flex justify-center space-x-3 mt-4">
          {links.facebook && (
            <a href={links.facebook} className="text-blue-500 hover:text-blue-600 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
          )}
          {links.github && (
            <a
              href={links.github}
              className="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {links.email && (
            <a href={`mailto:${links.email}`} className="text-red-500 hover:text-red-600 transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <main className="container mx-auto px-4 py-12 space-y-24">

        <section className="text-center space-y-8 py-12">
          <h2 className="text-4xl md:text-6xl text-green-500 font-bold leading-tight">
            Organiza tu vida con <span className="text-green-600">facilidad</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Te proporcionamos un chat y un calendario para mantenerte organizado y conectado en un solo lugar.
          </p>
          <Button onClick={() => signIn()}size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg rounded-full">
            Comenzar ahora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>

        <section className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-lg blur opacity-25"></div>
            <div className="relative">
              <Image
                src={ChatImage || "/placeholder.svg"}
                alt="Interfaz de chat"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
          <div className="space-y-8">
            <h3 className="text-3xl md:text-4xl font-semibold text-green-500">Comunicación sin problemas</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Mantente conectado con tus contactos y comparte información de manera eficiente.
            </p>
            <ul className="space-y-5">
              <FeatureItem icon={MessageCircle}>Contacta con tus amigos en tiempo real</FeatureItem>
              <FeatureItem icon={Users}>Crea grupos y envía información variada</FeatureItem>
              <FeatureItem icon={Clock}>Hecho con Socket.io para comunicación en tiempo real</FeatureItem>
            </ul>
            <Button className="bg-green-500 hover:bg-green-600 text-white">Explorar chat</Button>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 space-y-8">
            <h3 className="text-3xl md:text-4xl font-semibold text-green-500">Programa tu vida</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Mantén el control de tus actividades y nunca pierdas una fecha importante.
            </p>
            <ul className="space-y-5">
              <FeatureItem icon={Calendar}>Organiza tus fechas con facilidad</FeatureItem>
              <FeatureItem icon={Clock}>Anota eventos importantes y recibe recordatorios</FeatureItem>
              <FeatureItem icon={Users}>Establece límites de tiempo para completar tus tareas</FeatureItem>
            </ul>
            <Button className="bg-green-500 hover:bg-green-600 text-white">Explorar calendario</Button>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-lg blur opacity-25"></div>
            <div className="relative">
              <Image
                src={callendary || "/placeholder.svg"}
                alt="Interfaz de calendario"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        <section className="text-center space-y-12 py-8">
          <h3 className="text-3xl md:text-4xl font-semibold">Nuestro Equipo</h3>
          <div className="max-w-sm mx-auto">
            <TeamMember
              name="Diego Lopez"
              role="Desarrollador Web"
              image={Man}
              links={{
                github: "https://github.com/diegolopez",
                email: "diego.lopez@example.com",
              }}
            />
          </div>
        </section>
      </main>

   
    </div>
  )
}
