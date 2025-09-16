import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Send, Building, Package, CheckCircle2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useCurrentUser } from "@/hooks/api/useAuth";
import { toast } from "sonner";

interface Message {
  id: number;
  contenu: string;
  expediteur_id: number;
  destinataire_id: number;
  created_at: string;
  lu: boolean;
}

interface DirectChatProps {
  conversationId?: string;
  supplierId?: string;
  productId?: string;
  productName?: string;
}

export const DirectChat = ({ conversationId, supplierId, productId, productName }: DirectChatProps) => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => apiClient.get(`/conversations/${conversationId}/messages`),
    enabled: !!conversationId,
    refetchInterval: 3000
  });

  const { data: supplier } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => apiClient.get(`/entreprises/${supplierId}`),
    enabled: !!supplierId
  });

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const response = await apiClient.get('/conversations');
      const conversations = response.conversations || [];
      return conversations.find((conv: any) => conv.id === parseInt(conversationId || '0'));
    },
    enabled: !!conversationId
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiClient.post(`/conversations/${conversationId}/messages`, {
        contenu: messageData.contenu
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi du message");
    }
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: any) => {
      // S'assurer que le contexte est stringifyé
      const conversationData = {
        ...data,
        contexte: typeof data.contexte === 'object' ? JSON.stringify(data.contexte) : data.contexte
      };
      return apiClient.post('/conversations', conversationData);
    },
    onSuccess: (response) => {
      if (response.conversation_id) {
        window.location.href = `/messages/${response.conversation_id}`;
      } else {
        toast.error('Erreur lors de la création de la conversation');
      }
    },
    onError: (error) => {
      console.error('Erreur création conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    }
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      contenu: newMessage
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleStartConversation = () => {
    if (!supplierId || !supplier?.utilisateur_id) {
      toast.error('Impossible de démarrer la conversation');
      return;
    }

    createConversationMutation.mutate({
      destinataire_id: supplier.utilisateur_id,
      type: 'supplier_contact',
      contexte: {
        supplier_id: supplierId,
        supplier_name: supplier.nom_entreprise,
        ...(productId && {
          product_id: productId,
          product_name: productName
        })
      }
    });
  };

  if (!conversationId && supplierId) {
    return (
      <Card className="h-full">
        <CardHeader className="border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{supplier?.nom_entreprise}</CardTitle>
              <p className="text-sm text-gray-600">Fournisseur</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Commencer une conversation
            </h3>
            <p className="text-gray-600 mb-4">
              {productName ? `À propos de "${productName}"` : 'Contactez ce fournisseur'}
            </p>
            <Button onClick={handleStartConversation} disabled={createConversationMutation.isPending}>
              {createConversationMutation.isPending ? 'Création...' : 'Démarrer la conversation'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Building className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{supplier?.nom_entreprise}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                En ligne
              </Badge>
              {productName && (
                <Badge variant="secondary" className="text-xs">
                  <Package className="w-3 h-3 mr-1" />
                  {productName}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message: Message) => {
          const isCurrentUser = message.expediteur_id === user?.id;
          const senderName = isCurrentUser ? 
            `${user?.nom} ${user?.prenom || ''}`.trim() : 
            (user?.role_id === 1 ? 
              (supplier?.nom_entreprise || 'Fournisseur') : 
              (conversation?.acheteur_nom ? `${conversation.acheteur_nom} ${conversation.acheteur_prenom || ''}`.trim() : 'Client')
            );

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-gray-500 mb-1 px-1">
                  {senderName}
                </p>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.contenu}</p>
                  <p className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};