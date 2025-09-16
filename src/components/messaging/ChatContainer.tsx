import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, Users, Settings, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { MessageInput } from './MessageInput';
import { DevelopmentModeAlert } from './DevelopmentModeAlert';
import { ConnectionAlert } from './ConnectionAlert';
import { BusinessRuleAlert, ConversationInitiationGuard } from './BusinessRuleAlert';
import { MessagingRulesInfo } from './MessagingRulesInfo';
import { TypingIndicator } from './TypingIndicator';
import { UnreadCounter, useUnreadCounts } from './UnreadCounter';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useSocket } from '@/hooks/useSocket';
import { useCurrentUser } from '@/hooks/api/useAuth';
import '@/utils/testSocketConnection';
import { messageService } from '@/services/messageService';
import { apiClient } from '@/services/api';
import { useMessagingRules, useConversationPermissions } from '@/hooks/useMessagingRules';
import { isDevelopmentMode } from '@/config/constants';
import '@/utils/emergencyStop';
import '@/utils/socketDebugTest';
import type { 
  Conversation, 
  Message, 
  ConversationFilters,
  CreateConversationExtendedRequest,
  RealtimeMessage,
  TypingData,
  FileUploadResponse
} from '@/types/api';

// Interface pour le typage des données du fournisseur
interface Entreprise {
  utilisateur_id: number;
  nom_entreprise: string;
}

export interface ChatContainerProps {
  initialConversationId?: number;
  initialSupplierId?: number;
  initialProductId?: number;
  productName?: string;
  supplierName?: string;
  onConversationChange?: (conversation: Conversation | null) => void;
  className?: string;
  compact?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  initialConversationId,
  initialSupplierId,
  initialProductId,
  productName,
  supplierName,
  onConversationChange,
  className = '',
  compact = false
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [typingUsers, setTypingUsers] = useState<{ [conversationId: number]: TypingData[] }>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: currentUser } = useCurrentUser();
  const messagingRules = useMessagingRules();
  const conversationPermissions = useConversationPermissions(selectedConversation);

  // Hooks pour la gestion des données
  const {
    conversations,
    loading: conversationsLoading,
    updateConversation,
    addConversation
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    markAsRead,
    reload: loadMoreMessages
  } = useMessages(selectedConversation?.id || 0);

  // Configuration des gestionnaires WebSocket
  const webSocketHandlers = useMemo(() => ({
    onMessage: (realtimeMessage: any) => {
      if (realtimeMessage.type === 'message' && realtimeMessage.data) {
        const message: Message = realtimeMessage.data;
        
        if (message.conversation_id === selectedConversation?.id) {
          // Le message sera ajouté automatiquement via le hook useMessages
        }
        
        updateConversation(message.conversation_id, {
          updated_at: message.created_at
        });
      }
    },
    onTyping: (typingData: any) => {
      setTypingUsers(prev => {
        const conversationTyping = prev[typingData.conversation_id] || [];
        
        if (typingData.is_typing) {
          const existingIndex = conversationTyping.findIndex(
            t => t.user_id === typingData.user_id
          );
          
          if (existingIndex >= 0) {
            conversationTyping[existingIndex] = typingData;
          } else {
            conversationTyping.push(typingData);
          }
        } else {
          const filtered = conversationTyping.filter(
            t => t.user_id !== typingData.user_id
          );
          return {
            ...prev,
            [typingData.conversation_id]: filtered
          };
        }
        
        return {
          ...prev,
          [typingData.conversation_id]: conversationTyping
        };
      });
    },
    onConversationUpdate: (data: any) => {
      if (data.conversation) {
        updateConversation(data.conversation.id, data.conversation);
      }
    },
    onConnect: () => {
      console.log('WebSocket connecté');
    },
    onDisconnect: () => {
      console.log('WebSocket déconnecté');
    },
    onError: (error: Error) => {
      if (isDevelopmentMode) {
        console.log('[DEV] Erreur WebSocket:', error);
      } else {
        console.error('Erreur WebSocket:', error);
      }
    }
  }), [selectedConversation, updateConversation]);

  // Hook Socket.IO
  const socket = useSocket(webSocketHandlers);

  // Créer une nouvelle conversation
  const handleCreateConversation = useCallback(async () => {
    if (!initialSupplierId || !currentUser) {
      console.log('🔍 [ChatContainer] Conditions non remplies pour créer une conversation:', {
        initialSupplierId,
        currentUser: (currentUser as any)?.id
      });
      return;
    }

    if (!messagingRules.canInitiateConversation) {
      console.warn('🚫 [ChatContainer] Seuls les acheteurs peuvent initier des conversations avec les fournisseurs');
      return;
    }

    try {
      console.log('🚀 [ChatContainer] Début de création de conversation avec le fournisseur:', initialSupplierId);
      
      // Récupérer les données du fournisseur
      const supplierData = await apiClient.get(`/entreprises/${initialSupplierId}`);
      console.log('📋 [ChatContainer] Données fournisseur récupérées:', supplierData);
      
      const supplier: Entreprise = (supplierData as any).entreprise || (supplierData as any).data || supplierData as Entreprise;
      
      if (!supplier?.utilisateur_id) {
        console.warn('⚠️ [ChatContainer] Pas d\'utilisateur_id trouvé pour le fournisseur:', supplier);
        throw new Error('Impossible de trouver l\'utilisateur associé à ce fournisseur');
      }

      // Créer la conversation via l'API
      const conversationData = {
        fournisseur_id: initialSupplierId,
        produit_id: initialProductId || undefined,
        message_initial: `Bonjour, je suis intéressé par vos produits.`
      };

      console.log('📤 [ChatContainer] Envoi de la requête de création de conversation:', conversationData);
      
      // Créer une conversation temporaire pour l'affichage
      const tempConversation: Conversation = {
        id: Date.now(), // ID temporaire
        nom_entreprise: supplier.nom_entreprise || 'Fournisseur',
        fournisseur_nom: supplier.nom_entreprise || 'Fournisseur',
        fournisseur_id: initialSupplierId,
        acheteur_id: (currentUser as any)?.id || 0,
        sujet: 'Nouvelle conversation',
        statut: 'ouverte',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSelectedConversation(tempConversation);
      addConversation(tempConversation);
      
      console.log('✅ [ChatContainer] Conversation temporaire créée:', tempConversation);
      
    } catch (error) {
      console.error('❌ [ChatContainer] Erreur lors de la création de la conversation:', error);
      
      // En cas d'erreur, créer une conversation locale temporaire
      console.log('🔄 [ChatContainer] Création d\'une conversation locale temporaire');
      const tempConversation: Conversation = {
        id: Date.now(),
        nom_entreprise: 'Fournisseur',
        fournisseur_nom: 'Fournisseur',
        fournisseur_id: initialSupplierId,
        acheteur_id: (currentUser as any)?.id || 0,
        sujet: 'Nouvelle conversation',
        statut: 'ouverte',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSelectedConversation(tempConversation);
    }
  }, [initialSupplierId, initialProductId, productName, currentUser, messagingRules.canInitiateConversation, addConversation]);

  // Connecter Socket.IO au montage
  useEffect(() => {
    if (currentUser && !socket.isConnected) {
      socket.connect().catch((error) => {
        if (isDevelopmentMode) {
          console.log('[DEV] Erreur de connexion Socket.IO:', error);
        } else {
          console.error('Erreur de connexion Socket.IO:', error);
        }
      });
    }

    return () => {
      // Nettoyage conditionnel si nécessaire
      // Note : socket.disconnect() n'est pas appelé ici car le socket est un singleton
    };
  }, [currentUser, socket]);

  // Gérer la conversation initiale
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === initialConversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        loadSpecificConversation(initialConversationId);
      }
    } else if (initialSupplierId && !selectedConversation) {
      handleCreateConversation();
    }
  }, [initialConversationId, initialSupplierId, conversations, selectedConversation, handleCreateConversation]);

  // Fonction pour charger une conversation spécifique
  const loadSpecificConversation = useCallback(async (conversationId: number) => {
    try {
      const conversation = await messageService.getConversation(conversationId);
      setSelectedConversation(conversation);
      updateConversation(conversation.id, conversation);
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
      window.location.href = '/messages';
    }
  }, [updateConversation]);

  // Rejoindre/quitter les conversations Socket.IO
  useEffect(() => {
    if (selectedConversation && socket.isConnected) {
      socket.joinConversation(selectedConversation.id);
      
      return () => {
        socket.leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation?.id, socket]);

  // Notifier les changements de conversation
  useEffect(() => {
    onConversationChange?.(selectedConversation);
  }, [selectedConversation, onConversationChange]);

  // Sélectionner une conversation
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    if (selectedConversation && socket.isConnected) {
      socket.leaveConversation(selectedConversation.id);
    }
    
    setSelectedConversation(conversation);
  }, [selectedConversation, socket]);

  // Envoyer un message
  const handleSendMessage = useCallback(async (content: string, files?: FileUploadResponse[]) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      await sendMessage(content);
      
      if (socket.isConnected) {
        socket.sendTypingIndicator(selectedConversation.id, false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }, [selectedConversation, sendMessage, socket]);

  // Gérer l'indicateur de frappe
  const handleTyping = useCallback((isTyping: boolean) => {
    if (selectedConversation && socket.isConnected) {
      socket.sendTypingIndicator(selectedConversation.id, isTyping);
    }
  }, [selectedConversation, socket]);

  // Gérer la recherche
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implémenter la recherche
  }, []);

  // Gérer les filtres
  const handleFiltersChange = useCallback((filters: any) => {
    // TODO: Implémenter les filtres
  }, []);

  // Marquer les messages comme lus
  const handleMarkAsRead = useCallback(async (messageIds: number[]) => {
    if (!selectedConversation) return;
    
    try {
      await markAsRead(messageIds);
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
    }
  }, [selectedConversation, markAsRead]);

  // Calculer les compteurs de messages non lus
  const { totalUnread } = useUnreadCounts(conversations);

  // Obtenir les utilisateurs qui tapent dans la conversation actuelle
  const currentTypingUsers = selectedConversation 
    ? typingUsers[selectedConversation.id] || []
    : [];

  if (compact && isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <div className="relative">
          <Button
            onClick={() => setIsMinimized(false)}
            className="rounded-full shadow-lg"
            size="lg"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <UnreadCounter
            count={totalUnread}
            className="absolute -top-2 -right-2"
            size="sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <DevelopmentModeAlert />
      <ConnectionAlert />
      <MessagingRulesInfo className="mx-4 mt-2" compact />
      
      <div className="flex flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Liste des conversations */}
        <div className={`${compact ? 'w-80' : 'w-1/3'} min-w-[300px] border-r`}>
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Messages</h2>
              <UnreadCounter
                count={totalUnread}
                variant="secondary"
                size="sm"
              />
            </div>
            
            <div className="flex items-center space-x-1">
              {compact && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(true)}
                    className="p-1"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {/* Fermer le chat */}}
                    className="p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentUserId={(currentUser as any)?.id}
          />
        </div>

        {/* Zone de messages */}
        <div className="flex-1 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* En-tête de la conversation - FIXE */}
              <div className="flex-shrink-0 p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.sujet || 'Conversation'}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>
                        avec {selectedConversation.fournisseur_nom || selectedConversation.nom_entreprise}
                      </span>
                      {productName && (
                        <>
                          <span>•</span>
                          <span>À propos de "{productName}"</span>
                        </>
                      )}
                    </div>
                    
                    {currentTypingUsers.length > 0 && (
                      <TypingIndicator
                        typingUsers={currentTypingUsers.map(t => t.user_id || 0)}
                        className="mt-1"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Zone de messages - DÉFILABLE */}
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  conversationId={selectedConversation.id}
                  onError={(error, context) => console.error(`Erreur ${context}:`, error)}
                  onMessageSent={() => console.log('Message envoyé')}
                />
              </div>

              {/* Zone de saisie - FIXE */}
              <div className="flex-shrink-0">
                {conversationPermissions.canSendMessage ? (
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    conversationId={selectedConversation.id}
                    placeholder="Tapez votre message..."
                    disabled={selectedConversation.statut === 'fermee'}
                  />
                ) : (
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="text-center text-gray-500">
                      <p className="text-sm">
                        {!conversationPermissions.isParticipant 
                          ? "Vous n'êtes pas autorisé à participer à cette conversation"
                          : "Cette conversation est fermée"
                        }
                      </p>
                    </div>
                  </div>
                )}
                {selectedConversation.statut === 'fermee' && (
                  <div id="conversation-closed" className="sr-only">
                    Cette conversation est fermée et ne permet plus l'envoi de messages
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  {conversations.length === 0 
                    ? 'Aucune conversation'
                    : 'Sélectionnez une conversation'
                  }
                </h3>
                <p className="text-sm">
                  {conversations.length === 0 
                    ? 'Commencez une nouvelle conversation avec un fournisseur'
                    : 'Choisissez une conversation dans la liste pour commencer à discuter'
                  }
                </p>
                
                {initialSupplierId && !selectedConversation && (
                  <ConversationInitiationGuard 
                    currentUser={currentUser}
                    fallback={
                      <div className="text-center text-gray-500 mt-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-700">
                            <strong>Information fournisseur :</strong><br />
                            Vous pouvez répondre aux acheteurs qui vous contactent, 
                            mais vous ne pouvez pas initier de nouvelles conversations.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Button 
                      onClick={handleCreateConversation}
                      className="mt-4"
                      disabled={!messagingRules.canInitiateConversation}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Commencer la conversation
                    </Button>
                  </ConversationInitiationGuard>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};