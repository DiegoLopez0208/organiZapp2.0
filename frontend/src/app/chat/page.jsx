"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreVertical } from "lucide-react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

// Conexión con el servidor de WebSocket
const socket = io("http://localhost:4000");

export default function WhatsAppChat() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    if (session?.userId) {
      // Emitir evento para obtener contactos y grupos cuando el usuario se loguee
      socket.emit("get_contacts", session.userId);
      socket.emit("get_groups", session.userId);
    }

    // Escuchar eventos del servidor para actualizar la lista de contactos y grupos
    socket.on("contacts_updated", (contacts) => {
      setContacts(contacts);
    });

    socket.on("groups_updated", (groups) => {
      setGroups(groups);
    });

    socket.on("message_received", (message) => {
      if (message.senderId === currentContact?.id || message.recipientId === currentContact?.id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Limpiar los listeners cuando el componente se desmonte
    return () => {
      socket.off("contacts_updated");
      socket.off("groups_updated");
      socket.off("message_received");
    };
  }, [session, currentContact]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const message = {
        senderId: session.userId,
        recipientId: currentContact?.id,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // Enviar el mensaje al servidor para que se propague a los demás usuarios
      socket.emit("send_message", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");
    }
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() !== "") {
      // Emitir el evento al servidor para crear un grupo, pasando un objeto con el nombre del grupo y el nombre del usuario
      const groupData = {
        name: newGroupName,
        creatorName: session.user.name
      };
      console.log("Creating group:", groupData);
      socket.emit("create_group", groupData); // Enviar un solo objeto al servidor
      setNewGroupName("");
    }
  };

  const handleDeleteGroup = (groupName) => {
    // Emitir el evento al servidor para eliminar el grupo
    socket.emit("delete_group", groupName);
  };

  return (
    <div className="flex h-[900px] max-w-screen mx-auto border border-gray-500 overflow-hidden bg-gray-800 text-gray-100">
      {/* Lista de Contactos y Grupos */}
      <div className="w-1/3 bg-gray-600 border-gray-700">
        <div className="p-3 bg-gray-900">
          <Input placeholder="Search or start new chat" className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-green-500" />
        </div>
        <ScrollArea className="h-[calc(600px-56px)]">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 ${currentContact?.id === contact.id ? "bg-gray-500" : ""}`}
              onClick={() => setCurrentContact(contact)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>{contact.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3 overflow-hidden">
                <p className="font-semibold text-green-500">{contact.name}</p>
                <p className="text-sm text-white truncate">{contact.lastMessage}</p>
              </div>
              <span className="ml-auto text-xs text-white">{contact.time}</span>
            </div>
          ))}
          {groups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 ${currentContact?.id === group.id ? "bg-gray-500" : ""}`}
              onClick={() => setCurrentContact(group)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={group.avatar} alt={group.name} />
                <AvatarFallback>{group.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3 overflow-hidden">
                <p className="font-semibold text-green-600">{group.name}</p>
                <p className="text-sm text-white truncate">Group</p>
              </div>
              <Button onClick={() => handleDeleteGroup(group.name)} size="icon" variant="ghost" className="ml-auto text-white">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </ScrollArea>
        <div className="p-3 bg-gray-900">
          <Input
            placeholder="New Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full mb-2 bg-gray-800 text-gray-100 border-gray-700 focus:ring-green-500"
          />
          <Button onClick={handleCreateGroup} className="w-full bg-green-600 hover:bg-green-700">
            Create Group
          </Button>
        </div>
      </div>

      {/* Área de Chat */}
      <div className="w-2/3 p-4 flex flex-col">
        <ScrollArea className="flex-1">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.senderId === session.userId ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-lg p-2 m-1 ${message.senderId === session.userId ? "bg-green-500 text-white" : "bg-gray-700 text-gray-200"}`}>
                <p>{message.text}</p>
                <span className="text-xs text-gray-300">{message.time}</span>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="mt-4 flex items-center">
          <Input
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-800 text-gray-100 border-gray-700 focus:ring-green-500"
          />
          <Button onClick={handleSendMessage} size="icon" variant="ghost" className="ml-2 bg-green-600 hover:bg-green-700 text-white">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
