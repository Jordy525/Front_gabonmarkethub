import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Filter,
  Archive,
  Pin,
  Trash2,
  User,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  timestamp: string;
  is_read: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
}

interface ChatUser {
  id: number;
  name: string;
  avatar?: string;
  is_online: boolean;
  last_seen?: string;
  role: 'buyer' | 'supplier';
}

interface ImprovedChatContainerProps {
  conversationId: number;
  messages: Message[];
  currentUser: ChatUser;
  otherUser: ChatUser;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file') => void;
  onMarkAsRead: (messageId: number) => void;
  isLoading?: boolean;
}

export const ImprovedChatContainer: React.FC<ImprovedChatContainerProps> = ({
  conversationId,
  messages,
  currentUser,
  otherUser,
  onSendMessage,
  onMarkAsRead,
  isLoading = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = messages.filter(msg => 
      msg.receiver_id === currentUser.id && !msg.is_read
    );
    
    if (unreadMessages.length > 0) {
      unreadMessages.forEach(msg => onMarkAsRead(msg.id));
    }
  }, [messages, currentUser.id, onMarkAsRead]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value && !isTyping) {
      setIsTyping(true);
    } else if (!e.target.value && isTyping) {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender_id === currentUser.id) {
      if (message.is_read) {
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      } else {
        return <Check className="w-4 h-4 text-gray-400" />;
      }
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Chat Header */}
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gray-50/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback className="bg-green-100 text-green-700">
                {getInitials(otherUser.name)}
              </AvatarFallback>
            </Avatar>
            {otherUser.is_online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={otherUser.role === 'supplier' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {otherUser.role === 'supplier' ? 'Fournisseur' : 'Acheteur'}
              </Badge>
              <span className="text-xs text-gray-500">
                {otherUser.is_online ? 'En ligne' : `Vu ${otherUser.last_seen}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Commencez la conversation
                </h3>
                <p className="text-gray-500">
                  Envoyez votre premier message à {otherUser.name}
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.sender_id === currentUser.id;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                const showTime = index === messages.length - 1 || 
                  new Date(message.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 300000; // 5 minutes

                return (
                  <div key={message.id} className={cn(
                    "flex items-end space-x-2",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}>
                    {!isOwnMessage && showAvatar && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {getInitials(otherUser.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {!isOwnMessage && !showAvatar && (
                      <div className="w-8" /> // Spacer
                    )}

                    <div className={cn(
                      "flex flex-col max-w-xs lg:max-w-md",
                      isOwnMessage ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "rounded-2xl px-4 py-2 shadow-sm",
                        isOwnMessage 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-100 text-gray-900"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <div className={cn(
                        "flex items-center space-x-1 mt-1",
                        isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                      )}>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        {getMessageStatus(message)}
                      </div>
                    </div>

                    {isOwnMessage && (
                      <div className="w-8" /> // Spacer for alignment
                    )}
                  </div>
                );
              })
            )}
            
            {isLoading && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50/50">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm" className="shrink-0">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={`Tapez un message à ${otherUser.name}...`}
              className="pr-10 resize-none"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="shrink-0 bg-green-500 hover:bg-green-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {isTyping && (
          <div className="mt-2 text-xs text-gray-500">
            Vous tapez...
          </div>
        )}
      </div>
    </div>
  );
};
