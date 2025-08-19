import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  MoreVertical,
  Search,
  Archive,
  Clock,
  Check,
  CheckCheck
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

interface Conversation {
  id: number;
  clientId: number | null;
  clientPhone: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: string;
}

interface Message {
  id: number;
  conversationId: number;
  messageId: string;
  sender: string;
  messageType: string;
  content: string;
  mediaUrl: string | null;
  timestamp: string;
  status: string;
}

export default function Conversations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Load messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      return await apiRequest(`/api/conversations/${data.conversationId}/messages`, "POST", {
        sender: "business",
        messageType: "text",
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      setNewMessage("");
      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem.",
        variant: "destructive",
      });
    }
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      return await apiRequest(`/api/conversations/${conversationId}/mark-read`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.clientPhone.includes(searchTerm) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation && conversation.unreadCount > 0) {
        markAsReadMutation.mutate(selectedConversation);
      }
    }
  }, [selectedConversation, conversations]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
    });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Ontem";
    } else {
      return format(date, "dd/MM");
    }
  };

  const formatLastMessageTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Ontem";
    } else {
      return format(date, "dd/MM/yy");
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-green-600" />
              Conversas
            </h1>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center p-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                    selectedConversation === conversation.id ? "bg-gray-100 dark:bg-gray-800" : ""
                  }`}
                >
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {conversation.clientName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {conversation.clientName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="bg-green-600 text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatLastMessageTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {conversation.clientPhone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {selectedConversationData.clientName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversationData.clientName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedConversationData.clientPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <div className="max-w-xs lg:max-w-md animate-pulse">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "business" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === "business"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          message.sender === "business" ? "text-green-100" : "text-gray-500 dark:text-gray-400"
                        }`}>
                          <span className="text-xs">
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {message.sender === "business" && getMessageStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Escolha uma conversa para começar a visualizar as mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}