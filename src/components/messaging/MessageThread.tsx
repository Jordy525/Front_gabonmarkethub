import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { 
  Download, 
  Reply, 
  AlertCircle,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { formatDateSafely } from '@/utils/dateUtils';

interface Message {
  id: number;
  content: string;
  message_type: 'text' | 'file' | 'system';
  created_at: string;
  is_edited: boolean;
  edited_at: string | null;
  parent_message_id: number | null;
  sender_name: string;
  sender_id: number;
  sender_role_id: number;
  parent_content: string | null;
  parent_sender_name: string | null;
  attachments: Array<{
    id: number;
    filename: string;
    size: number;
    mimetype: string;
  }>;
  is_read_by_user: boolean;
}

interface ConversationDetails {
  id: number;
  type: 'private' | 'system';
  subject: string;
  created_at: string;
  updated_at: string;
  created_by_name: string;
}

interface Participant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role_nom: string;
  joined_at: string;
  last_read_at: string | null;
  is_muted: boolean;
}

interface MessageThreadProps {
  conversationId: number;
  onError: (error: any, context: string) => void;
  onMessageSent: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId,
  onError,
  onMessageSent
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll vers le bas
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Charger les détails de la conversation
  const loadConversationDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw { response };
      }

      const data = await response.json();
      setConversation(data.conversation);
      setParticipants(data.participants);

    } catch (error) {
      onError(error, 'chargement des détails de conversation');
    }
  }, [conversationId, onError]);

  // Charger les messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      const fullUrl = `${apiUrl}/messages/conversations/${conversationId}/messages`;
      
      console.log('🔍 MessageThread - URL de l\'API:', apiUrl);
      console.log('🔍 MessageThread - URL complète:', fullUrl);
      console.log('🔍 MessageThread - Conversation ID:', conversationId);
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 MessageThread - Status de la réponse:', response.status);
      console.log('🔍 MessageThread - Headers de la réponse:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw { response };
      }

      const data = await response.json();
      setMessages(data.messages || []);
      
      // Scroll vers le bas après chargement
      setTimeout(scrollToBottom, 100);

    } catch (error) {
      onError(error, 'chargement des messages');
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, onError, scrollToBottom]);



  // Télécharger un fichier joint
  const downloadAttachment = useCallback(async (attachmentId: number, filename: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/attachments/${attachmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw { response };
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      onError(error, 'téléchargement de fichier');
    }
  }, [onError]);

  // Formater la taille de fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtenir l'icône du fichier
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimetype.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };



  // Charger les données initiales
  useEffect(() => {
    if (conversationId) {
      Promise.all([
        loadConversationDetails(),
        loadMessages()
      ]);
    }
  }, [conversationId, loadConversationDetails, loadMessages]);

  // Skeleton de chargement
  const MessageSkeleton = () => (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <MessageSkeleton key={index} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages - Zone défilable uniquement */}
      <div className="flex-1 overflow-hidden">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <ProfileAvatar
                    photoUrl={message.sender_photo}
                    name={message.sender_name}
                    size="sm"
                  />
                </div>

                {/* Contenu du message */}
                <div className="flex-1 min-w-0">
                  {/* En-tête du message */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.sender_name}</span>
                    <span className="text-xs text-muted-foreground">
                                      {formatDateSafely(message.created_at, {
                  addSuffix: true,
                  fallback: 'Maintenant'
                })}
                    </span>
                    {message.is_edited && (
                      <Badge variant="outline" className="text-xs">
                        Modifié
                      </Badge>
                    )}
                  </div>

                  {/* Message parent (réponse) */}
                  {message.parent_content && (
                    <div className="bg-muted/50 border-l-2 border-muted-foreground/20 pl-3 py-2 mb-2 text-sm">
                      <p className="text-xs text-muted-foreground mb-1">
                        En réponse à {message.parent_sender_name}
                      </p>
                      <p className="text-muted-foreground">
                        {message.parent_content.length > 100 
                          ? `${message.parent_content.substring(0, 100)}...`
                          : message.parent_content
                        }
                      </p>
                    </div>
                  )}

                  {/* Contenu du message */}
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Fichiers joints */}
                    {message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 p-2 bg-background rounded border"
                          >
                            {getFileIcon(attachment.mimetype)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {attachment.filename}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadAttachment(attachment.id, attachment.filename)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions du message */}
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Répondre
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
