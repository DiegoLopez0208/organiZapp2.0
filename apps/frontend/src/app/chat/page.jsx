"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { socket } from "@/app/lib/socket";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Moon,
  Sun,
  Menu,
  ArrowLeft,
  Settings,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ModernChat() {
  const { data: session } = useSession();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [groups, setGroups] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ setLastMessages] = useState({});
  const messageInputRef = useRef(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  useEffect(() => {
    if (session) {
      setIsLoading(true);
      socket.emit("get_groups");

      socket.on("update_message", (information) => {
        if (
          information?.messagesIndex &&
          Array.isArray(information.messagesIndex)
        ) {
          const newMessages = information.messagesIndex.filter(
            (msg) => msg.content?.trim() !== "",
          );
          setMessages(newMessages);

          const lastMsgs = {};
          newMessages.forEach((msg) => {
            if (
              !lastMsgs[msg.groupId] ||
              new Date(msg.time) > new Date(lastMsgs[msg.groupId]?.time)
            ) {
              lastMsgs[msg.groupId] = msg;
            }
          });
          setLastMessages((prev) => ({ ...prev, ...lastMsgs }));
        } else {
          console.error("Error: 'messagesIndex' no es un arreglo válido.");
        }
        setIsLoading(false);
      });

      socket.on("groups_updated", (updatedGroups) => {
        setGroups(updatedGroups);
        setIsLoading(false);
      });

      return () => {
        socket.off("groups_updated");
        socket.off("new_message");
        socket.off("update_message");
        socket.off("get_groups");
      };
    }
  }, [session, currentChat]);

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

      setMessages((prevMessages) => [
        ...prevMessages,
        { ...message, content: newMessage, isOptimistic: true },
      ]);

      setNewMessage("");

      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  };

  const handleJoinGroup = (group) => {
    setIsLoading(true);
    socket.emit("join_group", group.id);
    setCurrentChat({ ...group, isGroup: true });
    setIsMobileMenuOpen(false);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() !== "") {
      const groupData = { name: newGroupName, creatorName: session.user.name };
      socket.emit("create_group", groupData);
      setNewGroupName("");
      toast({
        title: "Grupo Creado",
        description: `Has creado exitosamente el grupo "${newGroupName}"`,
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
      title: "Grupo Eliminado",
      description: "El grupo ha sido eliminado exitosamente",
      variant: "success",
    });
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredMessages = messages.filter(
    (msg) => msg.groupId === currentChat?.id,
  );

  const formatMessageTime = (time) => {
    if (!time) return "";

    if (typeof time === "string" && time.includes(":")) {
      return time;
    }

    try {
      return format(new Date(time), "HH:mm");
    } catch (e) {
      return "";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-green-600 dark:text-green-400">
            Chats
          </h1>
          <div className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full"
                >
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Mode</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 py-1 h-8 text-sm bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleJoinGroup(group)}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200",
                  currentChat?.id === group.id
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                  <AvatarImage
                    src={group.avatar || "/placeholder.svg"}
                    alt={group.name}
                  />
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium">
                    {getInitials(group.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {group.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {group.lastMessage
                      ? `${group.lastMessage.senderName}: ${group.lastMessage.content}`
                      : "No hay mensajes"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupToDelete(group);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? `No se encontraron grupos con "${searchTerm}"` : "No hay grupos disponibles"}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <Input
            placeholder="Nombre del nuevo grupo"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 h-8 text-sm bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            onKeyPress={(e) => e.key === "Enter" && handleCreateGroup()}
          />
          <Button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim()}
            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {session?.user && (
          <div className="flex items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Avatar className="h-7 w-7 mr-2">
              <AvatarImage
                src={session.user.image || "/placeholder.svg"}
                alt={session.user.name}
              />
              <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <main className="pt-16 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="h-[calc(100vh-4rem)] max-w-[1920px] mx-auto px-4">
          <div className="flex h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl">
            <div className="hidden md:flex md:w-80 h-full flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {renderSidebar()}
            </div>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetContent
                side="left"
                className="p-0 w-full sm:w-[400px] bg-white dark:bg-gray-800"
              >
                <div className="flex flex-col h-full">{renderSidebar()}</div>
              </SheetContent>
            </Sheet>

            <div className="flex-1 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
              {currentChat ? (
                <>
                  <div className="flex-shrink-0 h-16 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setCurrentChat(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium">
                          {getInitials(currentChat.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {currentChat.name}
                        </h2>
                        <p className="text-sm text-emerald-500 dark:text-emerald-400">
                          Grupo activo
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToDelete(currentChat);
                        setDeleteModalOpen(true);
                      }}
                      className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full px-6">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                        </div>
                      ) : (
                        <div className="py-6 space-y-6">
                          {filteredMessages.map((message, index) => {
                            const isCurrentUser =
                              message.senderName === session?.user.name;
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "flex",
                                  isCurrentUser ? "justify-end" : "justify-start",
                                )}
                              >
                                {!isCurrentUser && (
                                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                                    <AvatarImage
                                      src={
                                        message.senderImage ||
                                        "/placeholder.svg"
                                      }
                                      alt={message.senderName}
                                    />
                                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                      {getInitials(message.senderName)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div
                                  className={cn(
                                    "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                                    isCurrentUser
                                      ? "bg-emerald-500 text-white"
                                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                                  )}
                                >
                                  {!isCurrentUser && (
                                    <p className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                                      {message.senderName}
                                    </p>
                                  )}
                                  <p className="text-sm">
                                    {message.content || message.text}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-xs text-right mt-1",
                                      isCurrentUser
                                        ? "text-emerald-100"
                                        : "text-gray-400",
                                    )}
                                  >
                                    {formatMessageTime(message.time)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  <div className="flex-shrink-0 h-20 px-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center">
                    <Input
                      ref={messageInputRef}
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      className="flex-1 mr-4 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="icon"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-10 w-10"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="text-center max-w-md">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-6 inline-block mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-12 w-12 text-emerald-500 dark:text-emerald-400"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <path d="M8 10h.01" />
                        <path d="M12 10h.01" />
                        <path d="M16 10h.01" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      Bienvenido al Chat
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Selecciona un grupo del menú para comenzar a chatear o
                      crea uno nuevo
                    </p>
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => setIsMobileMenuOpen(true)}
                    >
                      <Menu className="h-4 w-4 mr-2" />
                      Ver Grupos
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar grupo?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el grupo{" "}
              <b>{groupToDelete?.name}</b>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (groupToDelete) {
                  handleDeleteGroup(groupToDelete.id);
                  setDeleteModalOpen(false);
                  setGroupToDelete(null);
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
