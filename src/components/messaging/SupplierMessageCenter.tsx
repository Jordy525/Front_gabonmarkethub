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
        {/* Header des actions - RESPONSIVE */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Messages</h2>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Gérez vos conversations avec les acheteurs
                </p>
              </div>
            </div>
            
            <div className="text-xs sm:text-sm text-muted-foreground">
              <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
              <span className="hidden sm:inline">Les acheteurs vous contactent directement depuis vos produits</span>
              <span className="sm:hidden">Les acheteurs vous contactent via vos produits</span>
            </div>
          </div>
        </div>

        {/* Filtres et recherche - RESPONSIVE */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                Toutes
              </Button>
              <Button
                variant={filterStatus === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('unread')}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                Non lues
              </Button>
              <Button
                variant={filterStatus === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('recent')}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                Récentes
              </Button>
            </div>

            {/* Statistiques */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>{filteredConversations.length} conversation(s)</span>
              {conversations && (
                <>
                  <span>•</span>
                  <span className="truncate">{conversations.filter(c => (c.messages_non_lus_fournisseur || 0) > 0).length} non lues</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal avec hauteur fixe */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Liste des conversations - RESPONSIVE */}
          <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 xl:w-96 border-r border-gray-200 bg-white flex-col`}>
            <div className="flex-shrink-0 p-3 sm:p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Conversations avec les acheteurs</span>
                <span className="sm:hidden">Conversations</span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {conversationsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Erreur lors du chargement des conversations
                  </AlertDescription>
                </Alert>
              ) : conversationsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 sm:h-4 bg-muted rounded animate-pulse" />
                        <div className="h-2 sm:h-3 bg-muted rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-xs sm:text-sm font-medium mb-2">
                    {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                  </p>
                  <p className="text-xs mb-3 sm:mb-4 px-2">
                    {searchTerm 
                      ? 'Essayez avec d\'autres termes de recherche'
                      : 'Attendez qu\'un acheteur vous contacte'
                    }
                  </p>
                  {!searchTerm && (
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                      <span className="hidden sm:inline">Les acheteurs peuvent vous contacter depuis vos produits</span>
                      <span className="sm:hidden">Contact via vos produits</span>
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

          {/* Zone de chat - RESPONSIVE */}
          <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex-col min-h-0`}>
            {selectedConversation ? (
              <SimpleChat
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-sm">
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Aucune conversation active
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
                    <span className="hidden sm:inline">Les acheteurs peuvent vous contacter directement depuis vos produits</span>
                    <span className="sm:hidden">Les acheteurs vous contactent via vos produits</span>
                  </p>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                    <span className="hidden sm:inline">Vous recevrez une notification quand un acheteur vous contacte</span>
                    <span className="sm:hidden">Notifications activées</span>
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