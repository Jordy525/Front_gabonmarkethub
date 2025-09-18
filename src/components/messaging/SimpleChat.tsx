// Composant de chat simple et fonctionnel - Version Ultra-Robuste Anti-Crash

import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Send, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMessages } from '@/hooks/useMessages';
import { useMessagingSocket } from '@/hooks/useMessagingSocket';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { MessageBubble } from './MessageBubble';
import type { Conversation, TypingData, User } from '@/types/messaging';

// Composant de fallback pour les erreurs de rendu
const MessageFallback: React.FC<{ error: Error; resetError: () => void }> = ({ error, resetError }) => (
  <div className="p-4 text-center">
    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
    <p className="text-sm text-gray-600 mb-2">Erreur d'affichage du message</p>
    <Button size="sm" onClick={resetError} variant="outline">
      Réessayer
    </Button>
  </div>
);

// Composant de message sécurisé avec gestion d'erreur
const SafeMessageBubble: React.FC<{
  message: any;
  isOwn: boolean;
  senderName: string;
  showSenderName: boolean;
}> = ({ message, isOwn, senderName, showSenderName }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (hasError) {
    return (
      <MessageFallback 
        error={error!} 
        resetError={() => setHasError(false)} 
      />
    );
  }

  // Gestion d'erreur simple sans ErrorBoundary
  try {
    return (
      <MessageBubble
        message={message}
        isOwn={isOwn}
        senderName={senderName}
        showSenderName={showSenderName}
      />
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Erreur de rendu');
    setHasError(true);
    setError(error);
    console.warn('Erreur dans MessageBubble:', error);
    
    return (
      <MessageFallback 
        error={error} 
        resetError={() => setHasError(false)} 
      />
    );
  }
};

interface SimpleChatProps {
  conversation: Conversation;
  onBack?: () => void;
  className?: string;
}

export const SimpleChat: React.FC<SimpleChatProps> = ({
  conversation,
  onBack,
  className = ''
}) => {
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isMounted, setIsMounted] = useState(true);
  const [renderKey, setRenderKey] = useState(0); // Clé de re-rendu pour éviter les erreurs DOM
  
  // Refs sécurisées avec vérification de montage
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const errorRecoveryRef = useRef<NodeJS.Timeout>();

  const { data: currentUser } = useCurrentUser();
  const { messages, loading, error, sending, sendMessage, markAsRead } = useMessages(conversation.id);

  // Gestionnaire de frappe sécurisé
  const handleTyping = useCallback((data: TypingData) => {
    if (!isMounted) return;
    
    try {
      if (data.conversation_id === conversation.id && data.user_id !== (currentUser as User)?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.is_typing) {
            newSet.add(data.user_id);
          } else {
            newSet.delete(data.user_id);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la gestion de la frappe:', error);
    }
  }, [conversation.id, currentUser, isMounted]);

  const { isConnected, startTyping, stopTyping } = useMessagingSocket({
    onTyping: handleTyping
  });

  // Scroll automatique ultra-sécurisé avec récupération d'erreur
  const scrollToBottom = useCallback(() => {
    if (!isMounted) return;
    
    // Nettoyer le timeout précédent
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Utiliser un timeout pour s'assurer que le DOM est stable
    scrollTimeoutRef.current = setTimeout(() => {
      if (!isMounted) return;
      
      try {
        if (messagesEndRef.current && 
            messagesContainerRef.current && 
            document.contains(messagesEndRef.current) &&
            document.contains(messagesContainerRef.current)) {
          
          // Vérification géométrique supplémentaire
          const rect = messagesEndRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            messagesEndRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'end'
            });
          }
        }
      } catch (error) {
        console.warn('Erreur lors du scroll automatique:', error);
        // Tentative de récupération
        if (errorRecoveryRef.current) {
          clearTimeout(errorRecoveryRef.current);
        }
        errorRecoveryRef.current = setTimeout(() => {
          if (isMounted) {
            setRenderKey(prev => prev + 1); // Forcer un re-rendu
          }
        }, 1000);
      }
    }, 200); // Délai augmenté pour stabilité DOM
  }, [isMounted]);

  // Scroll automatique vers le bas avec protection
  useEffect(() => {
    if (!isMounted) return;
    
    scrollToBottom();
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (errorRecoveryRef.current) {
        clearTimeout(errorRecoveryRef.current);
      }
    };
  }, [messages, scrollToBottom, isMounted]);

  // Marquer comme lu quand on ouvre la conversation
  useEffect(() => {
    if (!isMounted || messages.length === 0) return;
    
    try {
      const unreadMessages = messages.filter(m => !m.lu && m.expediteur_id !== (currentUser as User)?.id);
      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages.map(m => m.id));
      }
    } catch (error) {
      console.warn('Erreur lors du marquage comme lu:', error);
    }
  }, [messages, currentUser, markAsRead, isMounted]);

  // Envoyer un message sécurisé
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isMounted || !messageText.trim() || sending) return;

    try {
      await sendMessage(messageText);
      
      if (!isMounted) return;
      
      setMessageText('');
      stopTyping(conversation.id);
      
      // Focus sécurisé sur l'input après envoi
      setTimeout(() => {
        if (!isMounted) return;
        
        try {
          if (inputRef.current && 
              document.contains(inputRef.current) &&
              inputRef.current.offsetParent !== null) {
            inputRef.current.focus();
          }
        } catch (error) {
          console.warn('Erreur lors du focus:', error);
        }
      }, 300);
    } catch (err) {
      if (isMounted) {
        console.error('Erreur envoi:', err);
      }
    }
  }, [messageText, sending, sendMessage, stopTyping, conversation.id, isMounted]);

  // Gestion de la frappe sécurisée
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMounted) return;
    
    const value = e.target.value;
    setMessageText(value);

    if (!isConnected) return;

    try {
      // Démarrer la frappe
      if (value && !messageText) {
        startTyping(conversation.id);
      }

      // Debouncing pour arrêter la frappe
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (value) {
        typingTimeoutRef.current = setTimeout(() => {
          if (isMounted) {
            stopTyping(conversation.id);
          }
        }, 2000);
      } else {
        stopTyping(conversation.id);
      }
    } catch (error) {
      console.warn('Erreur lors de la gestion de la frappe:', error);
    }
  }, [messageText, isConnected, startTyping, stopTyping, conversation.id, isMounted]);

  // Arrêter la frappe quand on quitte le champ
  const handleInputBlur = useCallback(() => {
    if (!isMounted) return;
    
    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping(conversation.id);
    } catch (error) {
      console.warn('Erreur lors de l\'arrêt de la frappe:', error);
    }
  }, [stopTyping, conversation.id, isMounted]);

  // Gestion du montage/démontage
  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
      
      // Nettoyage sécurisé de tous les timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (errorRecoveryRef.current) {
        clearTimeout(errorRecoveryRef.current);
      }
    };
  }, []);

  // Nom de l'autre participant mémorisé
  const otherPartyName = useMemo(() => {
    if (!isMounted) return '';
    
    try {
      return (currentUser as User)?.role_id === 1 
        ? conversation.nom_entreprise || `${conversation.fournisseur_nom} ${conversation.fournisseur_prenom}`.trim()
        : `${conversation.acheteur_nom} ${conversation.acheteur_prenom}`.trim();
    } catch (error) {
      console.warn('Erreur lors du calcul du nom:', error);
      return 'Contact';
    }
  }, [currentUser, conversation, isMounted]);

  // Messages sécurisés avec clés stables et validation
  const safeMessages = useMemo(() => {
    if (!isMounted || !Array.isArray(messages)) return [];
    
    try {
      return messages
        .filter(message => message && typeof message === 'object' && message.id)
        .map((message, index) => {
          try {
            const isOwn = message.expediteur_id === (currentUser as User)?.id;
            const senderName = message.expediteur 
              ? `${message.expediteur.prenom} ${message.expediteur.nom}`
              : (isOwn ? 'Vous' : 'Expéditeur');
            
            const showSenderName = index === 0 || 
              (index > 0 && messages[index - 1]?.expediteur_id !== message.expediteur_id);

            return {
              ...message,
              isOwn,
              senderName,
              showSenderName,
              // Clé stable pour éviter les problèmes de rendu React
              stableKey: `msg-${message.id}-${message.expediteur_id}-${message.created_at}-${renderKey}`
            };
          } catch (error) {
            console.warn('Erreur lors du traitement d\'un message:', error);
            return null;
          }
        })
        .filter((message): message is NonNullable<typeof message> => message !== null); // Type guard pour filtrer les null
    } catch (error) {
      console.warn('Erreur lors du traitement des messages:', error);
      return [];
    }
  }, [messages, currentUser, isMounted, renderKey]);

  // Ne pas rendre si le composant n'est plus monté
  if (!isMounted) {
    return null;
  }

  return (
    <Card className={`h-full flex flex-col ${className}`} key={renderKey}>
      {/* Header - RESPONSIVE */}
      <CardHeader className="flex-shrink-0 border-b bg-white p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                disabled={!isMounted}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base truncate">{otherPartyName}</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{conversation.sujet}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500 hidden sm:inline">
              {isConnected ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Zone des messages - SEULEMENT CETTE ZONE DÉFILE */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {error && (
          <Alert variant="destructive" className="m-4 mx-4 mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Chargement des messages...
            </div>
          </div>
        ) : (
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-3 sm:px-4 pb-3 sm:pb-4 min-h-0"
          >
            {safeMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Aucun message dans cette conversation</p>
                <p className="text-sm">Envoyez le premier message !</p>
              </div>
            ) : (
              <Suspense fallback={
                <div className="text-center text-gray-500 py-4">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Chargement des messages...
                </div>
              }>
                <div className="space-y-4">
                  {safeMessages.map((messageData) => (
                    <SafeMessageBubble
                      key={messageData.stableKey}
                      message={messageData}
                      isOwn={messageData.isOwn}
                      senderName={messageData.senderName}
                      showSenderName={messageData.showSenderName}
                    />
                  ))}

                  {/* Indicateur de frappe */}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-600">
                          {typingUsers.size === 1 ? 'Quelqu\'un' : `${typingUsers.size} personnes`} 
                          {' '}en train d'écrire...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Référence pour le scroll automatique */}
                  <div ref={messagesEndRef} className="h-1" />
                </div>
              </Suspense>
            )}
          </div>
        )}
      </div>

      {/* Zone de saisie - RESPONSIVE */}
      <div className="flex-shrink-0 border-t bg-white p-3 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={messageText}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Tapez votre message..."
            disabled={sending || !isConnected || !isMounted}
            className="flex-1 text-sm sm:text-base"
          />
          <Button 
            type="submit" 
            disabled={!messageText.trim() || sending || !isConnected || !isMounted}
            size="sm"
            className="flex-shrink-0"
          >
            {sending ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </form>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-1">
            Connexion perdue - Reconnexion en cours...
          </p>
        )}
      </div>
    </Card>
  );
};