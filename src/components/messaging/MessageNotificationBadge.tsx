import React, { useEffect, useState } from 'react';
import { MessageCircle, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { useConversations } from '@/hooks/useConversations';
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatDateSafely } from '@/utils/dateUtils';
import { fr } from 'date-fns/locale';
import type { Conversation, RealtimeMessage } from '@/types/api';

export interface MessageNotificationBadgeProps {
  className?: string;
  onConversationClick?: (conversation: Conversation) => void;
}

export const MessageNotificationBadge: React.FC<MessageNotificationBadgeProps> = ({
  className = '',
  onConversationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Conversation[]>([]);

  const {
    conversations,
    loading,
    refresh
  } = useConversations({ archivee: false }, { limit: 10 });

  // Calculer le nombre total de messages non lus
  const totalUnreadCount = conversations.reduce((total, conv) => {
    return total + (conv.messages_non_lus_acheteur || 0) + (conv.messages_non_lus_fournisseur || 0);
  }, 0);

  // Obtenir les conversations avec des messages non lus
  const unreadConversations = conversations.filter(conv => 
    (conv.messages_non_lus_acheteur || 0) + (conv.messages_non_lus_fournisseur || 0) > 0
  ).slice(0, 5);

  // WebSocket pour les mises à jour temps réel
  const webSocket = useWebSocket({
    onMessage: (message: RealtimeMessage) => {
      if (message.type === 'message') {
        // Rafraîchir les conversations pour mettre à jour les compteurs
        refresh();
        
        // Afficher une notification si nécessaire
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nouveau message', {
            body: message.data?.contenu || 'Vous avez reçu un nouveau message',
            icon: '/favicon.ico'
          });
        }
      }
    }
  });

  // Connecter WebSocket
  useEffect(() => {
    webSocket.connect().catch(console.error);
    return () => webSocket.disconnect();
  }, [webSocket]);

  // Demander la permission pour les notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleConversationClick = (conversation: Conversation) => {
    setIsOpen(false);
    onConversationClick?.(conversation);
  };

  const getParticipantName = (conversation: Conversation) => {
    return conversation.fournisseur?.nom_entreprise || 
           conversation.acheteur?.nom || 
           'Utilisateur inconnu';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 ${className}`}
        >
          <MessageCircle className="w-5 h-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs min-w-[18px] h-5"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Messages</h3>
            {totalUnreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalUnreadCount} non lus
              </Badge>
            )}
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <span className="text-sm">Chargement...</span>
            </div>
          ) : unreadConversations.length > 0 ? (
            <div className="divide-y">
              {unreadConversations.map((conversation) => {
                const unreadCount = (conversation.messages_non_lus_acheteur || 0) + 
                                  (conversation.messages_non_lus_fournisseur || 0);
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation)}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getParticipantName(conversation)}
                          </p>
                          <div className="flex items-center space-x-1">
                            <Badge variant="default" className="text-xs px-1.5 py-0.5">
                              {unreadCount}
                            </Badge>
                          </div>
                        </div>
                        
                        {conversation.sujet && (
                          <p className="text-sm text-gray-600 truncate mb-1">
                            {conversation.sujet}
                          </p>
                        )}
                        
                        {conversation.dernier_message && (
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.dernier_message.contenu}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-1">
                                          {formatDateSafely(conversation.updated_at, {
                  addSuffix: true,
                  fallback: 'Récemment'
                })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium mb-1">Aucun nouveau message</p>
              <p className="text-xs">Vos conversations apparaîtront ici</p>
            </div>
          )}
        </div>
        
        {conversations.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-blue-600 hover:text-blue-700"
              onClick={() => {
                setIsOpen(false);
                // Naviguer vers la page des messages
                window.location.href = '/messages';
              }}
            >
              Voir tous les messages
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};