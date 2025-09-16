import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  User as UserIcon,
  AlertCircle,
  Loader2,
  Search,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ConversationList } from './ConversationList';
import { SimpleChat } from './SimpleChat';
import SupplierHeader from '@/components/layout/SupplierHeader';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { useConversations } from '@/hooks/useConversations';
import type { Conversation, User } from '@/types/messaging';

export const SupplierMessageCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'recent'>('all');
  
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const { 
    conversations, 
    loading: conversationsLoading, 
    error: conversationsError,
    refetch: refetchConversations 
  } = useConversations();

  // Simuler le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filtrer les conversations
  const filteredConversations = conversations?.filter(conv => {
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const convText = `${conv.sujet || ''} ${conv.acheteur_nom || ''} ${conv.acheteur_prenom || ''}`.toLowerCase();
      if (!convText.includes(searchLower)) return false;
    }

    // Filtre par statut
    if (filterStatus === 'unread') {
      const unreadCount = conv.messages_non_lus_fournisseur || 0;
      if (unreadCount === 0) return false;
    }

    return true;
  }) || [];

  // Gérer les erreurs
  const handleError = (error: any, context: string) => {
    console.error(`Erreur ${context}:`, error);
    toast({
      title: "Erreur",
      description: `Erreur lors de ${context}`,
      variant: "destructive"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Chargement du centre de messages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header fournisseur - FIXE */}
      <div className="flex-shrink-0">
        <SupplierHeader />
      </div>
      
      {/* Contenu principal avec hauteur fixe */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header des actions - FIXE */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Messages - Fournisseur</h2>
                <p className="text-sm text-muted-foreground">
                  Gérez vos conversations avec les acheteurs
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Les acheteurs vous contactent directement depuis vos produits
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche - FIXE */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher dans les conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Toutes
              </Button>
              <Button
                variant={filterStatus === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('unread')}
              >
                Non lues
              </Button>
              <Button
                variant={filterStatus === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('recent')}
              >
                Récentes
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            <span>{filteredConversations.length} conversation(s)</span>
            {conversations && (
              <>
                <span>•</span>
                <span>{conversations.filter(c => (c.messages_non_lus_fournisseur || 0) > 0).length} avec messages non lus</span>
              </>
            )}
          </div>
        </div>

        {/* Contenu principal avec hauteur fixe */}
        <div className="flex-1 flex min-h-0">
          {/* Liste des conversations - DÉFILABLE */}
          <div className="w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col">
            <div className="flex-shrink-0 p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations avec les acheteurs
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {conversationsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erreur lors du chargement des conversations
                  </AlertDescription>
                </Alert>
              ) : conversationsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-medium mb-2">
                    {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                  </p>
                  <p className="text-xs mb-4">
                    {searchTerm 
                      ? 'Essayez avec d\'autres termes de recherche'
                      : 'Attendez qu\'un acheteur vous contacte'
                    }
                  </p>
                  {!searchTerm && (
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Les acheteurs peuvent vous contacter depuis vos produits
                    </div>
                  )}
                </div>
              ) : (
                <ConversationList
                  conversations={filteredConversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={setSelectedConversation}
                  currentUserId={(currentUser as User)?.id}
                />
              )}
            </div>
          </div>

          {/* Zone de chat - DÉFILABLE */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedConversation ? (
              <SimpleChat
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    Aucune conversation active
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Les acheteurs peuvent vous contacter directement depuis vos produits
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <UserIcon className="h-4 w-4 inline mr-1" />
                    Vous recevrez une notification quand un acheteur vous contacte
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};