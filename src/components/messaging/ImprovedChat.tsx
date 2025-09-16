import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { MessagePagination } from './MessagePagination';
import { toast } from 'sonner';

interface Message {
  id: number;
  contenu: string;
  expediteur_id: number;
  expediteur_nom?: string;
  expediteur_prenom?: string;
  created_at: string;
  is_read: boolean;
  type: 'text' | 'image' | 'file';
  fichier_url?: string;
}

interface ImprovedChatProps {
  conversationId: number;
  messages: Message[];
  currentUserId: number;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  onLoadMoreMessages?: (page: number) => Promise<void>;
  totalMessages?: number;
  messagesPerPage?: number;
  isLoading?: boolean;
  isSending?: boolean;
}

export const ImprovedChat: React.FC<ImprovedChatProps> = ({
  conversationId,
  messages,
  currentUserId,
  onSendMessage,
  onLoadMoreMessages,
  totalMessages = 0,
  messagesPerPage = 20,
  isLoading = false,
  isSending = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas seulement pour les nouveaux messages
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  
  useEffect(() => {
    // Ne faire le scroll automatique que si de nouveaux messages sont ajoutés et que l'utilisateur n'a pas scrollé vers le haut
    if (messages.length > previousMessageCount && messagesEndRef.current && !userScrolledUp) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setPreviousMessageCount(messages.length);
  }, [messages.length, previousMessageCount, userScrolledUp]);

  // Détecter si l'utilisateur scroll vers le haut
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setUserScrolledUp(!isNearBottom);
  };

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalMessages / messagesPerPage);

  // Gérer l'envoi de message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Charger plus de messages
  const handleLoadMore = async () => {
    if (!onLoadMoreMessages || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      await onLoadMoreMessages(nextPage);
      setCurrentPage(nextPage);
      
      // Vérifier s'il y a encore des messages à charger
      if (nextPage >= totalPages) {
        setHasMore(false);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Formater l'heure
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Grouper les messages par date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex flex-col h-full">
      {/* En-tête du chat - fixe */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>CH</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">Conversation</h3>
              <p className="text-sm text-gray-500">
                {totalMessages} message{totalMessages > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Zone des messages avec scroll interne */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
        onScroll={handleScroll}
      >
        {/* Bouton pour charger plus de messages en haut */}
        {hasMore && onLoadMoreMessages && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2"
            >
              <ChevronUp className="w-4 h-4" />
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                'Voir anciens messages'
              )}
            </Button>
          </div>
        )}

        {/* Messages groupés par date */}
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date} className="space-y-4">
            {/* En-tête de date */}
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="text-xs">
                {formatDate(dayMessages[0].created_at)}
              </Badge>
            </div>

            {/* Messages du jour */}
            {dayMessages.map((message, index) => {
              const isOwn = message.expediteur_id === currentUserId;
              const prevMessage = index > 0 ? dayMessages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.expediteur_id !== message.expediteur_id;

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {showAvatar && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback>
                        {message.expediteur_nom?.[0] || message.expediteur_prenom?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {/* Espace pour l'avatar si pas affiché */}
                  {!showAvatar && <div className="w-8 flex-shrink-0" />}

                  {/* Contenu du message */}
                  <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
                    {/* Nom de l'expéditeur */}
                    {showAvatar && (
                      <span className="text-xs text-gray-500 mb-1">
                        {message.expediteur_nom} {message.expediteur_prenom}
                      </span>
                    )}

                    {/* Bulle de message */}
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.contenu}</p>
                    </div>

                    {/* Heure et statut */}
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs text-gray-400">
                        {formatTime(message.created_at)}
                      </span>
                      {isOwn && (
                        <div className="w-2 h-2">
                          {message.is_read ? (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement des messages...
            </div>
          </div>
        )}

        {/* Référence pour le scroll automatique */}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie - fixe en bas */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              disabled={isSending}
              className="resize-none"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled={isSending}>
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={isSending}>
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
