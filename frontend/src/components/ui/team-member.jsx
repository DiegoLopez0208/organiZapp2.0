import { Card, CardContent } from "@/components/ui/card"
const TeamMember = ({ name, role, image }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6 text-center">
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
 
  export default TeamMember