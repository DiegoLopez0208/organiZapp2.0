import Image from "next/image"
import { MessageCircle, Calendar, Users, Clock, Facebook, Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card , CardContent } from "@/components/ui/card"

import { Man, Woman } from "@/app/lib/image"

export default function Home() {
  const FeatureItem = ({ icon: Icon, children }) => (
    <li className="flex items-center space-x-3">
      <Icon className="text-green-500 h-5 w-5" />
      <span>{children}</span>
    </li>
  )

const TeamMember = ({ name, role, image }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6  text-white text-center">
        <Image
          src={image}
          alt={name}
          width={200}
          height={200}
          className="rounded-full mx-auto mb-4"
        />
        <h4 className="font-semibold">{name}</h4>
        <p className="text-gray-400">{role}</p>
        <div className="flex justify-center space-x-2 mt-4">
          <a href="#" className="text-gray-400 hover:text-white">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="container mx-auto px-4 py-12 space-y-24">
        
        {/* Section 1: Main Intro */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold">Organiza tu vida con facilidad</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Te proporcionamos un chat y un calendario para mantenerte organizado y conectado.
          </p>
          <Button size="lg" className="bg-green-500 hover:bg-green-600">Comenzar</Button>
        </section>

        {/* Section 2: Comunicación sin problemas */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Interfaz de chat"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-semibold">Comunicación sin problemas</h3>
            <ul className="space-y-4">
              <FeatureItem icon={MessageCircle}>Contacta con tus amigos en tiempo real</FeatureItem>
              <FeatureItem icon={Users}>Crea grupos y envía información variada</FeatureItem>
              <FeatureItem icon={Clock}>Hecho con Socket.io para comunicación en tiempo real</FeatureItem>
            </ul>
          </div>
        </section>

        {/* Section 3: Programación sin esfuerzo */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 space-y-6">
            <h3 className="text-2xl md:text-3xl font-semibold">Programación sin esfuerzo</h3>
            <ul className="space-y-4">
              <FeatureItem icon={Calendar}>Organiza tus fechas</FeatureItem>
              <FeatureItem icon={Clock}>Anota eventos importantes</FeatureItem>
              <FeatureItem icon={Users}>Establece límites de tiempo para completar tus tareas</FeatureItem>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Interfaz de calendario"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Section 4: Nuestro Equipo */}
        <section className="text-center space-y-12">
          <h3 className="text-3xl md:text-4xl font-semibold">Nuestro Equipo</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[ 
              { name: "Agustin Gercek", role: "Desarrollador Web", image: Man },
              { name: "Diego Lopez", role: "Desarrollador Web", image: Man },
              { name: "Facundo Burgos", role: "Desarrollador Web", image: Man },
              { name: "Gricelda Canaza", role: "Desarrolladora Web", image: Woman },
            ].map((member) => (
              <TeamMember key={member.name} {...member} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}