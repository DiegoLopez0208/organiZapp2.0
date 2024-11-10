'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MoreVertical, Users, UserPlus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {Man , Woman} from "@/app/lib/image"

export default function WhatsAppChat() {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Alice", avatar: "https://www.svgrepo.com/show/954/woman.svg", lastMessage: "Hey, how are you?", time: "10:30 AM" },
    { id: 2, name: "Bob", avatar: "https://www.kindpng.com/picc/m/63-638024_png-file-svg-man-with-tie-silhouette-transparent.png", lastMessage: "Can we meet tomorrow?", time: "Yesterday" },
    { id: 3, name: "Charlie", avatar: "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-person-icon.png", lastMessage: "Thanks for the help!", time: "Tuesday" },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there!", sent: false, time: "10:30 AM" },
    { id: 2, text: "Hi! How are you?", sent: true, time: "10:31 AM" },
    { id: 3, text: "I'm good, thanks for asking. How about you?", sent: false, time: "10:32 AM" },
  ]);

  const [groups, setGroups] = useState([
    { id: 1, name: "Family", avatar: "https://www.svgrepo.com/show/10134/team.svg" },
    { id: 2, name: "Work", avatar: "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/group-female-icon.png" },
  ]);

  const [currentContact, setCurrentContact] = useState(contacts[0]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const message = {
        id: messages.length + 1,
        text: newMessage,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  }

  const handleCreateGroup = () => {
    if (newGroupName.trim() !== "") {
      const newGroup = {
        id: groups.length + 1,
        name: newGroupName,
        avatar: "/placeholder.svg?height=32&width=32"
      };
      setGroups([...groups, newGroup]);
      setNewGroupName("");
    }
  }

  return (
    <div className="flex h-[900px] max-w-screen mx-auto border border-gray-500 overflow-hidden bg-gray-800 text-gray-100">
      {/* Contacts and Groups List */}
      <div className="w-1/3 bg-gray-600  border-gray-700">
        <div className="p-3 bg-gray-900">
          <Input placeholder="Search or start new chat" className="w-full bg-gray-800 text-gray-100 border-gray-700 focus:ring-green-500" />
        </div>
        <ScrollArea className="h-[calc(600px-56px)]">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 ${currentContact.id === contact.id ? 'bg-gray-500' : ''}`}
              onClick={() => setCurrentContact(contact)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>{contact.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-3 overflow-hidden">
                <p className="font-semibold text-green-500">{contact.name}</p>
                <p className="text-sm text-whit truncate">{contact.lastMessage}</p>
              </div>
              <span className="ml-auto text-xs text-white">{contact.time}</span>
            </div>
          ))}
          {groups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-500 ${currentContact.id === group.id ? 'bg-gray-500' : ''}`}
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
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-800">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 bg-gray-900">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentContact.avatar} alt={currentContact.name} />
              <AvatarFallback>{currentContact.name[0]}</AvatarFallback>
            </Avatar>
            <span className="ml-3 font-semibold text-green-500">{currentContact.name}</span>
          </div>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-100 hover:bg-gray-700">
                  <UserPlus className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-800 border-gray-700">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none text-gray-100">Crea un nuevo grupo</h4>
                    <p className="text-sm text-gray-400">
                      Elige el nombre del nuevo grupo.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="groupName"
                      placeholder="Nombre Del Grupo"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="bg-gray-700 text-gray-100 border-gray-600 focus:ring-green-500"
                    />
                    <Button onClick={handleCreateGroup} className="bg-green-500 text-white hover:bg-green-600">Crear grupo</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sent ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sent ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${message.sent ? 'text-green-200' : 'text-gray-400'}`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-3 bg-gray-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <Input
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-gray-800 text-gray-100 border-gray-700 focus:ring-green-500"
            />
            <Button type="submit" size="icon" className="bg-green-500 text-white hover:bg-green-600">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
