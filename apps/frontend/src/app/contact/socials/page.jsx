import Image from "next/image";
import Link from "next/link";
import {
  Github,
  Linkedin,
  Twitter,
  Facebook,
  MessageCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import manpng from "../../../../public/assets/man.png";
import womanpng from "../../../../public/assets/woman.png";

const teamMembers = [
  {
    name: "Agustin Gercek",
    role: "Desarrollador Web",
    image: manpng,
    github: "https://github.com/AgustinGercek",
    linkedin: "https://linkedin.com/in/agustingercek",
    twitter: "https://twitter.com/agustingercek",
  },
  {
    name: "Diego Lopez",
    role: "Desarrollador Web",
    image: manpng,
    github: "https://github.com/DiegoLopez",
    linkedin: "https://linkedin.com/in/diegolopez",
    twitter: "https://twitter.com/diegolopez",
  },
  {
    name: "Facundo Burgos",
    role: "Desarrollador Web",
    image: manpng,
    github: "https://github.com/FacundoBurgos",
    linkedin: "https://linkedin.com/in/facundoburgos",
    twitter: "https://twitter.com/facundoburgos",
  },
  {
    name: "Gricelda Canaza",
    role: "Desarrolladora Web",
    image: womanpng,
    github: "https://github.com/GriceldaCanaza",
    linkedin: "https://linkedin.com/in/griceldacanaza",
    twitter: "https://twitter.com/griceldacanaza",
  },
];

export default function Socials() {
  return (
    <div className="dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-green-500 mb-12">
          Nuestro Equipo
        </h1>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <Card
              key={member.name}
              className="dark:bg-gray-800 border-green-500"
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={150}
                    height={150}
                    className="rounded-full mb-4"
                  />
                  <h2 className="text-xl font-semibold text-green-400 mb-1">
                    {member.name}
                  </h2>
                  <p className="dark:text-gray-400  text-gray-700 mb-4">
                    {member.role}
                  </p>
                  <div className="flex space-x-2 mb-4">
                    <SocialLink
                      href={member.github}
                      icon={Github}
                      label="GitHub"
                      className="text-blue-400"
                    />
                    <SocialLink
                      href={member.linkedin}
                      icon={Linkedin}
                      label="LinkedIn"
                    />
                    <SocialLink
                      href={member.twitter}
                      icon={Twitter}
                      label="Twitter"
                    />
                  </div>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4 " />
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  return (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        size="icon"
        className="hover:text-green-500"
        aria-label={label}
      >
        <Icon className="h-5 w-5" />
      </Button>
    </Link>
  );
}
