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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header normal pour les acheteurs - FIXE */}
      <div className="flex-shrink-0">
        <Header />
      </div>
      
      {/* Contenu principal avec hauteur fixe */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header des actions - FIXE */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Messages - Acheteur</h2>
                <p className="text-sm text-muted-foreground">
                  Contactez les fournisseurs et gérez vos conversations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* <Button
                variant="outline"
                onClick={() => setShowFullSupplierList(true)}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Voir tous les fournisseurs
              </Button> */}
              <Button
                onClick={() => setShowSupplierContactList(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Contacter un fournisseur
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
                    <span>{conversations.filter(c => (c.messages_non_lus_acheteur || 0) > 0).length} avec messages non lus</span>
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
                    Conversations
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
                          : 'Commencez par contacter un fournisseur'
                        }
                      </p>
                      {!searchTerm && (
                        <Button 
                          onClick={handleCreateConversation}
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
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
                        Sélectionnez une conversation
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Choisissez une conversation dans la liste à gauche pour commencer à échanger
                      </p>
                      <Button 
                        onClick={handleCreateConversation}
                        className="flex items-center gap-2"
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
