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
  Menu,
  ImageIcon,
  Smile,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  UserPlus,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { format } from "date-fns";

export default function ModernChat() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [groups, setGroups] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
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
        console.log("Mensajes después de filtrar:", newMessages);
        setMessages(newMessages);
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
  }, [session]);

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
        title: "Group Created",
        description: `You've successfully created the group "${newGroupName}"`,
      });
    }
  };

  // Handle deleting a group
  const handleDeleteGroup = (groupId, e) => {
    e.stopPropagation(); // Prevent triggering the group selection

    if (confirm("Are you sure you want to delete this group?")) {
      socket.emit("delete_group", groupId);

      if (currentChat?.id === groupId) {
        setCurrentChat(null);
      }

      setGroups(groups.filter((group) => group.id !== groupId));

      toast({
        title: "Group Deleted",
        description: "The group has been successfully deleted",
      });
    }
  };

  // Filter groups based on search term
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filter messages for current chat
  const filteredMessages = messages.filter(
    (msg) => msg.groupId === currentChat?.id,
  );

  // Format time for messages
  const formatMessageTime = (time) => {
    if (!time) return "";

    // If it's already a formatted string, return it
    if (typeof time === "string" && time.includes(":")) {
      return time;
    }

    // If it's a timestamp, format it
    try {
      return format(new Date(time), "HH:mm");
    } catch (e) {
      return "";
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date();
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  const messageGroups = groupMessagesByDate(filteredMessages);

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Render the sidebar with groups
  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-green-600 dark:text-green-400">
            Chats
          </h1>
          <div className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
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
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>System Default</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full"
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
                  "flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 mb-1",
                  currentChat?.id === group.id
                    ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarImage
                    src={group.avatar || "/placeholder.svg"}
                    alt={group.name}
                  />
                  <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    {getInitials(group.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {group.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {group.lastMessageTime}
                    </p>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 rounded-full"
                        onClick={(e) => handleDeleteGroup(group.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Group</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))
          ) : searchTerm ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No groups found matching "{searchTerm}"
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No groups available. Create one below!
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <Input
            placeholder="New Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            onKeyPress={(e) => e.key === "Enter" && handleCreateGroup()}
          />
          <Button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim()}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {session?.user && (
          <div className="flex items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage
                src={session.user.image || "/placeholder.svg"}
                alt={session.user.name}
              />
              <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
            </div>
            <Badge
              variant="outline"
              className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
            >
              Active
            </Badge>
          </div>
        )}
      </div>
    </div>
  );

  // Render the chat area
  const renderChatArea = () => (
    <div className="flex flex-col h-full">
      {currentChat ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
                onClick={() => setCurrentChat(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                <AvatarImage
                  src={currentChat.avatar || "/placeholder.svg"}
                  alt={currentChat.name}
                />
                <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  {getInitials(currentChat.name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {currentChat.name}
                  </h2>
                  <Badge className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={(e) => handleDeleteGroup(currentChat.id, e)}
                  >
                    Delete Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea
            ref={chatContainerRef}
            className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading messages...
                </p>
              </div>
            ) : filteredMessages.length > 0 ? (
              <div className="space-y-6">
                {messageGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    <div className="flex items-center justify-center"></div>

                    {group.messages.map((message, index) => {
                      const isCurrentUser =
                        message.senderName === session?.user.name;
                      const isLastMessage =
                        index === group.messages.length - 1 &&
                        groupIndex === messageGroups.length - 1;

                      return (
                        <div
                          key={index}
                          ref={isLastMessage ? lastMessageRef : null}
                          className={cn(
                            "flex",
                            isCurrentUser ? "justify-end" : "justify-start",
                          )}
                        >
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                              <AvatarFallback className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {getInitials(message.senderName)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                              isCurrentUser
                                ? "bg-green-500 text-white rounded-tr-none"
                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none",
                              message.isOptimistic && "opacity-70",
                            )}
                          >
                            {!isCurrentUser && (
                              <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                                {message.senderName}
                              </p>
                            )}

                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content || message.text}
                            </p>

                            <p
                              className={cn(
                                "text-xs text-right mt-1",
                                isCurrentUser
                                  ? "text-green-100"
                                  : "text-gray-500 dark:text-gray-400",
                              )}
                            >
                              {formatMessageTime(message.time)}
                              {message.isOptimistic && " • Sending"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
                  <MessageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Be the first to send a message in this group!
                </p>
              </div>
            )}
          </ScrollArea>

          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex space-x-1 mr-2"></div>

              <Input
                ref={messageInputRef}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-full"
              />

              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="ml-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="text-center max-w-md">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 inline-block mb-6">
              <MessageIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Welcome to ModernChat
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect with friends and colleagues in real-time. Select a group
              from the sidebar or create a new one to start messaging.
            </p>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Users className="mr-2 h-5 w-5" />
              View Groups
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const MessageIcon = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
    </svg>
  );

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-80 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        {renderSidebar()}
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[85%] max-w-sm">
          {renderSidebar()}
        </SheetContent>
      </Sheet>

      {/* Mobile Header (only shown when no chat is selected) */}
      {!currentChat && (
        <div className="md:hidden fixed top-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-600 dark:text-green-400">
            ModernChat
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-full"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">{renderChatArea()}</div>
    </div>
  );
}
