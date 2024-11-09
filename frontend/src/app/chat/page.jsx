"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Send } from "lucide-react";

// Simulated data - replace with your actual data fetching logic
const users = [
  { id: 1, name: "Alice", image: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Bob", image: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Charlie", image: "/placeholder.svg?height=40&width=40" },
];

const groups = [
  { id: 1, name: "Proyecto A", members: [1, 2] },
  { id: 2, name: "Equipo de Marketing", members: [2, 3] },
];

const rooms = [
  { id: 1, name: "General" },
  { id: 2, name: "Soporte Técnico" },
];

export default function Chat() {
  const [activeChat, setActiveChat] = useState("users");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "You", content: newMessage }]);
      setNewMessage("");
      // Aquí iría la lógica para enviar el mensaje al backend
    }
  };

  const handleCreateGroup = () => {
    console.log("Crear nuevo grupo");
  };

  const handleCreateRoom = () => {
    console.log("Crear nueva sala");
  };

  return (
    <div className="flex max-h-full bg-gray-900 text-gray-100">
      <div className="w-64 bg-gray-700 p-2">
        <Tabs defaultValue="users" onValueChange={(value) => setActiveChat(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="rooms">Salas</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <ScrollArea className="h-[calc(100vh-120px)]">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                  <Image src={user.image} alt={user.name} width={40} height={40} className="rounded-full" />
                  <span>{user.name}</span>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="groups">
            <ScrollArea className="h-[calc(100vh-160px)]">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                  <span>{group.name}</span>
                </div>
              ))}
            </ScrollArea>
            <Button onClick={handleCreateGroup} className="w-full mt-2">
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Grupo
            </Button>
          </TabsContent>
          <TabsContent value="rooms">
            <ScrollArea className="h-[calc(100vh-160px)]">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                  <span>{room.name}</span>
                </div>
              ))}
            </ScrollArea>
            <Button onClick={handleCreateRoom} className="w-full mt-2">
              <PlusCircle className="mr-2 h-4 w-4" /> Nueva Sala
            </Button>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.sender === "You" ? "text-right" : "text-left"}`}>
              <div className={`inline-block p-2 rounded-lg ${message.sender === "You" ? "bg-green-600" : "bg-gray-700"}`}>
                <p className="font-bold">{message.sender}</p>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 bg-gray-800">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
