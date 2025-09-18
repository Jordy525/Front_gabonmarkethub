import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Plus, 
  Building2,
  AlertCircle,
  Loader2,
  Search,
  User as UserIcon,
  Mail
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ConversationList } from './ConversationList';
import { SimpleChat } from './SimpleChat';
import { SupplierList } from './SupplierList';
import { SupplierContactList } from './SupplierContactList';
import { ImprovedChat } from './ImprovedChat';
import Header from '@/components/layout/Header';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useNavigate } from 'react-router-dom';
import type { Conversation, User } from '@/types/messaging';
import type { Supplier } from '@/types/supplier';

export const BuyerMessageCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSupplierList, setShowSupplierList] = useState(false);
  const [showSupplierContactList, setShowSupplierContactList] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'recent'>('all');
  const [showSuppliersList, setShowSuppliersList] = useState(false);
  const [showFullSupplierList, setShowFullSupplierList] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const { 
    conversations, 
    loading: conversationsLoading, 
    error: conversationsError,
    refetch: refetchConversations 
  } = useConversations();
  
  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
    refetch: refetchSuppliers
  } = useSuppliers();

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
      const convText = `${conv.sujet || ''} ${conv.nom_entreprise || ''} ${conv.fournisseur_nom || ''} ${conv.fournisseur_prenom || ''}`.toLowerCase();
      if (!convText.includes(searchLower)) return false;
    }

    // Filtre par statut
    if (filterStatus === 'unread') {
      const unreadCount = conv.messages_non_lus_acheteur || 0;
      if (unreadCount === 0) return false;
    }

    return true;
  }) || [];

  // Rediriger vers la liste des fournisseurs
  const handleCreateConversation = () => {
    setShowSupplierList(true);
  };

  // Gérer les erreurs
  const handleError = (error: any, context: string) => {
    console.error(`Erreur ${context}:`, error);
    toast({
      title: "Erreur",
      description: `Erreur lors de ${context}`,
      variant: "destructive"
    });
  };

  // Créer une conversation directe avec un fournisseur
  const handleDirectContact = async (supplier: Supplier) => {
    try {
      // Créer la conversation d'abord
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour contacter un fournisseur",
          variant: "destructive"
        });
        return;
      }

      // Créer la conversation
      const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fournisseur_id: supplier.utilisateur_id,
          sujet: `Conversation avec ${supplier.nom_entreprise}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la conversation');
      }

      const conversationData = await response.json();
      
      // Rediriger vers le chat avec l'ID de la conversation
      navigate(`/messages?conversation=${conversationData.data?.id || ''}&supplier=${supplier.utilisateur_id}&supplierName=${encodeURIComponent(supplier.nom_entreprise)}`);

      toast({
        title: "Conversation créée",
        description: `Conversation créée avec ${supplier.nom_entreprise}`,
      });
    } catch (error: any) {
      console.error('Erreur création conversation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de la conversation",
        variant: "destructive"
      });
    }
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
    <div className="min-h-screen flex flex-col">
      {/* Header normal pour les acheteurs - FIXE */}
      <div className="flex-shrink-0">
        <Header />
      </div>
      
      {/* Contenu principal - PLEIN ÉCRAN */}
      <div className="flex-1 flex flex-col bg-gray-50" style={{height: 'calc(100vh - 64px)'}}>
        {/* Header des actions - RESPONSIVE */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-2 sm:px-6 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              <div>
                <h2 className="text-base sm:text-xl font-semibold">Messages</h2>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Contactez les fournisseurs et gérez vos conversations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-3">
              <Button
                onClick={() => setShowSupplierContactList(true)}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Contacter un fournisseur</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation vers la liste complète des fournisseurs */}
        {showFullSupplierList && (
          <div className="flex-1 overflow-hidden">
            <SupplierList
              onContactSupplier={handleDirectContact}
              onBack={() => setShowFullSupplierList(false)}
            />
          </div>
        )}

        {/* Liste des fournisseurs pour contact */}
        {showSupplierContactList && (
          <div className="flex-1 overflow-hidden">
            <SupplierContactList
              onContactSupplier={(supplier) => {
                // Rediriger vers le chat avec le fournisseur
                const params = new URLSearchParams({
                  supplier: supplier.id.toString(),
                  supplierName: supplier.nom_entreprise
                });
                window.location.href = `/messages?${params.toString()}`;
              }}
              onBack={() => setShowSupplierContactList(false)}
            />
          </div>
        )}

        {/* Contenu principal - masqué quand on affiche les listes */}
        {!showFullSupplierList && !showSupplierContactList && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filtres et recherche - RESPONSIVE */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100 px-2 sm:px-6 py-2 sm:py-4">
              <div className="flex flex-col gap-2 sm:gap-4">
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
                <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
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
                      <span className="truncate">{conversations.filter(c => (c.messages_non_lus_acheteur || 0) > 0).length} non lues</span>
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
                    Conversations
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
                          : 'Commencez par contacter un fournisseur'
                        }
                      </p>
                      {!searchTerm && (
                        <Button 
                          onClick={handleCreateConversation}
                          size="sm"
                          className="text-xs sm:text-sm"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Nouvelle conversation
                        </Button>
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
                        Sélectionnez une conversation
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
                        Choisissez une conversation dans la liste pour commencer à échanger
                      </p>
                      <Button 
                        onClick={handleCreateConversation}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Créer une conversation
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Liste des fournisseurs pour créer une conversation */}
        {showSupplierList && (
          <SupplierContactList
            onContactSupplier={async (supplier) => {
              try {
                // Créer la conversation d'abord
                const token = localStorage.getItem('authToken');
                if (!token) {
                  toast({
                    title: "Erreur",
                    description: "Vous devez être connecté pour contacter un fournisseur",
                    variant: "destructive"
                  });
                  return;
                }

                // Créer la conversation
                const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                body: JSON.stringify({
                  fournisseur_id: supplier.utilisateur_id,
                  sujet: `Conversation avec ${supplier.nom_entreprise}`
                })
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Erreur lors de la création de la conversation');
                }

                const conversationData = await response.json();
                
                // Rediriger vers le chat avec l'ID de la conversation
                navigate(`/messages?conversation=${conversationData.data?.id || ''}&supplier=${supplier.utilisateur_id}&supplierName=${encodeURIComponent(supplier.nom_entreprise)}`);
                
                toast({
                  title: "Conversation créée",
                  description: `Conversation créée avec ${supplier.nom_entreprise}`,
                });
              } catch (error: any) {
                console.error('Erreur création conversation:', error);
                toast({
                  title: "Erreur",
                  description: error.message || "Erreur lors de la création de la conversation",
                  variant: "destructive"
                });
              }
            }}
            onBack={() => setShowSupplierList(false)}
            className="fixed inset-0 bg-white z-50 overflow-auto"
          />
        )}
      </div>
    </div>
  );
};
