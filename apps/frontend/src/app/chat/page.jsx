"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { socket } from "@/app/lib/socket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  Send,
  Plus,
  Search,
  Users,
  Settings,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";

export default function ModernChat() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const [groups, setGroups] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    socket.emit("get_groups");

    socket.on("update_message", (information) => {
      if (
        information?.messagesIndex &&
        Array.isArray(information.messagesIndex)
      ) {
        const newMessages = information.messagesIndex.filter(
          (msg) => msg.content?.trim() !== "",
        );
        console.log("Mensajes después de filtrar:", newMessages);
        setMessages(newMessages);
      } else {
        console.error("Error: 'messagesIndex' no es un arreglo válido.");
      }
    });

    socket.on("groups_updated", setGroups);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }

    return () => {
      socket.off("groups_updated");
      socket.off("new_message");
      socket.off("get_groups");
    };
  }, [session, messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const message = {
        senderName: session.user.name,
        text: newMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        groupId: currentChat?.id,
      };

      socket.emit("send_message", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");
    }
  };

  const handleJoinGroup = (group) => {
    socket.emit("join_group", group.id);
    setCurrentChat({ ...group, isGroup: true });
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() !== "") {
      const groupData = { name: newGroupName, creatorName: session.user.name };
      socket.emit("create_group", groupData);
      setNewGroupName("");
      toast({
        title: "Group Created",
        description: `You've successfully created the group "${newGroupName}"`,
      });
    }
  };

  const handleDeleteGroup = (groupId) => {
    socket.emit("delete_group", groupId);
    if (currentChat?.id === groupId) {
      setCurrentChat(null);
    }
    setGroups(groups.filter((group) => group.id !== groupId));
    toast({
      title: "Group Deleted",
      description: "The group has been successfully deleted",
    });
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredMessages = messages.filter(
    (msg) => msg.groupId === currentChat?.id,
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 flex-col md:flex-row">
      <div className="w-full md:w-72 h-72 md:h-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-green-600 dark:text-gray-200">
              Groups
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5 text-green-600 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search groups"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>
        <ScrollArea className="h-[650px] overflow-y-auto">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentChat?.id === group.id
                  ? "bg-gray-100 dark:bg-gray-700"
                  : ""
              }`}
            >
              <div className="flex-1" onClick={() => handleJoinGroup(group)}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={group.avatar} alt={group.name} />
                  <AvatarFallback>
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 overflow-hidden">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {group.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {group.lastMessage}
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Group</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 ">
          <Input
            placeholder="New Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleCreateGroup} className="w-full bg-green-500">
            <Plus className="h-5 w-5 mr-2" /> Create Group
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={currentChat.avatar}
                    alt={currentChat.name}
                  />
                  <AvatarFallback>
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {currentChat.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {`${currentChat.membersCount || 0} members`}
                  </p>
                </div>
              </div>
            </div>
            <ScrollArea
              ref={chatContainerRef}
              className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto max-h-[700px]"
            >
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex mb-4 ${
                      message.senderName === session?.user.name
                        ? "justify-end"
                        : "justify-start"
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
                        <p className="text-xs font-medium mb-1">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-right mt-1 opacity-70">
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No messages yet.</p>
              )}
            </ScrollArea>
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 mr-2"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Welcome to ModernChat
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Select a group to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
