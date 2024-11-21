'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { socket } from "@/app/lib/socket"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { Send, Plus, Search, Users, UserPlus, Settings } from 'lucide-react'

export default function ModernChat() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {

    socket.on('get_groups', (groups) => {
      console.log(groups);  // Verifica qué datos llegan
      setGroups(groups);
    });
    socket.on("new_message", handleNewMessage)
    socket.on("update_message", (information) => {
      if (information?.messagesIndex && Array.isArray(information.messagesIndex)) {
        console.log(information)
        setMessages((prevMessages) => [...prevMessages, ...information.messagesIndex])
      } else {
        console.error("Error: 'messages' no es un arreglo válido.");
      }
    })

    return () => {
      socket.off("contacts_updated")
      socket.off("groups_updated")
      socket.off("new_message")
      socket.off('get_groups')
    }
  }, [session])
  

  const handleNewMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message])
  }

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const message = {
        senderName: session.user.name,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        groupId: currentChat?.isGroup ? currentChat.id : null,
        recipientName: currentChat?.isGroup ? null : currentChat?.name,
      }

      socket.emit("send_message", message)
      setNewMessage("")
      handleNewMessage(message)
    }
  }

  const handleJoinGroup = (group) => {
    socket.emit("join_group", group.id)
    setCurrentChat({ ...group, isGroup: true })
  }

  const handleCreateGroup = () => {
    if (newGroupName.trim() !== "") {
      const groupData = { name: newGroupName, creatorName: session.user.name }
      socket.emit("create_group", groupData)
      setNewGroupName("")
      toast({
        title: "Group Created",
        description: `You've successfully created the group "${newGroupName}"`,
      })
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMessages = messages.filter((msg) => {
    if (currentChat?.isGroup) {
      return msg.groupId === currentChat.id
    } else if (currentChat) {
      return (
        (msg.senderName === currentChat.name && msg.recipientName === session?.user.name) ||
        (msg.senderName === session?.user.name && msg.recipientName === currentChat.name)
      )
    }
    return false
  })

  return (
    <div className="flex h-auto bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-green-600 dark:text-gray-200">Chats</h1>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserPlus className="h-5 w-5 text-green-600 dark:text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Contact</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5 text-green-600 dark:text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-700 px-4">
            <TabsTrigger value="contacts" className="data-[state=active]:border-b-2 data-[state=active]:border-green-500">Contacts</TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:border-b-2 data-[state=active]:border-green-500">Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="contacts" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currentChat?.id === contact.id ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                  onClick={() => setCurrentChat({ ...contact, isGroup: false })}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 overflow-hidden">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{contact.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unreadCount > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="groups" className="mt-0">
            <ScrollArea className="h-[calc(100vh-230px)]">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currentChat?.id === group.id ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                  onClick={() => handleJoinGroup(group)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={group.avatar} alt={group.name} />
                    <AvatarFallback><Users className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div className="ml-3 overflow-hidden">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{group.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{group.lastMessage}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className=" border-t border-gray-200 dark:border-gray-700">
              <Input
                placeholder="New Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className=""
              />
              <Button onClick={handleCreateGroup} className="w-full bg-green-500">
                <Plus className="h-5 w-5 mr-2" /> Create Group
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
                  <AvatarFallback>{currentChat.isGroup ? <Users className="h-5 w-5" /> : currentChat.name[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{currentChat.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentChat.isGroup ? `${currentChat.membersCount || 0} members` : "Online"}
                  </p>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
              {filteredMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${
                    message.senderName === session?.user.name ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderName === session?.user.name
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {message.senderName !== session?.user.name && (
                      <p className="text-xs font-medium mb-1">{message.senderName}</p>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs text-right mt-1 opacity-70">{message.time}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 mr-2"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Welcome to ModernChat</h2>
              <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}