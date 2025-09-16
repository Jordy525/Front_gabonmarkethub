import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MessageSquare,
    Users,
    ArrowLeft,
    Send,
    Phone,
    Video,
    Info,
    RefreshCw,
    Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SupplierLayout from '@/components/layout/SupplierLayout';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { SimpleChat } from '@/components/messaging/SimpleChat';
import { formatDateSafely } from '@/utils/dateUtils';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Conversation } from '@/types/messaging';

// Composant interne qui utilise le ConversationManager
const SupplierMessagesPageContent: React.FC = () => {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();

    const {
        conversations,
        activeConversation,
        totalUnreadCount,
        isLoading,
        error,
        openConversation,
        refreshConversations,
        getConversationUrl
    } = useConversations({
        autoLoadConversations: true,
        navigateOnOpen: false, // We'll handle navigation manually
        markAsReadOnOpen: true
    });

    const [localError, setLocalError] = useState<string | null>(null);

    // Logs pour déboguer côté fournisseur
    useEffect(() => {
        console.log('🏪 FOURNISSEUR - État conversations:', {
            conversationsCount: conversations.length,
            isLoading,
            error,
            currentUser: currentUser ? {
                id: currentUser.id,
                role_id: currentUser.role_id,
                nom: currentUser.nom
            } : null,
            conversations: conversations.map(c => ({
                id: c.id,
                sujet: c.sujet,
                acheteur_data: {
                    acheteur_nom: (c as any).acheteur_nom,
                    acheteur_prenom: (c as any).acheteur_prenom,
                    acheteur_email: (c as any).acheteur_email
                }
            }))
        });
    }, [conversations, isLoading, error, currentUser]);

    // Sélectionner la conversation depuis l'URL
    useEffect(() => {
        if (conversationId && conversations.length > 0) {
            const targetConversationId = parseInt(conversationId);
            const conversation = conversations.find(c => c.id === targetConversationId);
            if (conversation && activeConversation?.id !== targetConversationId) {
                // Ouvrir la conversation via ConversationManager
                openConversation(targetConversationId).catch(error => {
                    console.error('Error opening conversation from URL:', error);
                    setLocalError('Impossible d\'ouvrir cette conversation');
                });
            }
        }
    }, [conversationId, conversations, activeConversation, openConversation]);

    // Gérer la sélection d'une conversation
    const handleSelectConversation = async (conversation: Conversation) => {
        try {
            setLocalError(null);
            await openConversation(conversation.id);
            const conversationUrl = getConversationUrl(conversation.id);
            navigate(conversationUrl);
        } catch (error) {
            console.error('Error selecting conversation:', error);
            setLocalError('Impossible d\'ouvrir cette conversation');
            toast.error('Erreur lors de l\'ouverture de la conversation');
        }
    };

    // Retour à la liste des conversations
    const handleBackToList = () => {
        navigate('/supplier/messages');
    };

    // Gérer le rafraîchissement
    const handleRefresh = async () => {
        try {
            setLocalError(null);
            await refreshConversations();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors du rafraîchissement';
            setLocalError(errorMessage);
        }
    };

    if (!currentUser) {
        return (
            <SupplierLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Connexion requise
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Vous devez être connecté pour accéder à vos messages.
                                </p>
                                <Button onClick={() => navigate('/supplier/login')}>
                                    Se connecter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SupplierLayout>
        );
    }

    // Rediriger les acheteurs vers leur interface
    if (currentUser.role_id === 1) {
        navigate('/messages');
        return null;
    }

    return (
        <SupplierLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Titre de la section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="h-6 w-6 text-blue-600" />
                                Messages
                                <Badge variant="secondary" className="ml-2">
                                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                                </Badge>
                                {totalUnreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        {totalUnreadCount} non lu{totalUnreadCount !== 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gérez vos conversations avec les acheteurs
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Actualiser
                            </Button>

                            {activeConversation && (
                                <Button
                                    variant="outline"
                                    onClick={handleBackToList}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Retour à la liste
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Affichage des erreurs */}
                    {(error || localError) && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>
                                {error || localError}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">

                    {/* Liste des conversations */}
                    <div className={`lg:col-span-4 ${activeConversation ? 'hidden lg:block' : ''}`}>
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Conversations avec les acheteurs
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-0">
                                {isLoading && conversations.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        Chargement des conversations...
                                    </div>
                                ) : (error || localError) && conversations.length === 0 ? (
                                    <div className="p-4 text-center text-red-500">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <h3 className="font-medium text-red-800 mb-2">Erreur de chargement</h3>
                                            <p className="text-sm">{error || localError}</p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleRefresh}
                                                disabled={isLoading}
                                                className="mt-2"
                                            >
                                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                                Réessayer
                                            </Button>
                                        </div>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <h3 className="font-medium text-gray-900 mb-2">Aucune conversation</h3>
                                        <p className="text-sm text-gray-600">
                                            Les acheteurs intéressés par vos produits vous contacteront ici.
                                        </p>
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-blue-700">
                                                💡 <strong>Conseil :</strong> Assurez-vous que vos produits sont bien référencés
                                                pour attirer plus d'acheteurs !
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[calc(100vh-350px)]">
                                        <div className="divide-y divide-gray-200">
                                            {conversations.map((conversation) => {
                                                const isSelected = activeConversation?.id === conversation.id;

                                                // Nom de l'acheteur
                                                const acheteurNom = (conversation as any).acheteur_nom || '';
                                                const acheteurPrenom = (conversation as any).acheteur_prenom || '';
                                                const acheteurComplet = `${acheteurNom} ${acheteurPrenom}`.trim() || 'Acheteur inconnu';

                                                const unreadCount = conversation.messages_non_lus_fournisseur || 0;

                                                return (
                                                    <div
                                                        key={conversation.id}
                                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                                                            }`}
                                                        onClick={() => handleSelectConversation(conversation)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                                                                <Avatar className="w-10 h-10 flex-shrink-0">
                                                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                                                        {acheteurNom?.charAt(0).toUpperCase() || 'A'}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                            {acheteurComplet}
                                                                        </h3>
                                                                        {unreadCount > 0 && (
                                                                            <Badge variant="destructive" className="text-xs">
                                                                                {unreadCount}
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-xs text-gray-600 mt-1 truncate">
                                                                        {conversation.sujet || 'Demande de renseignements'}
                                                                    </p>

                                                                    {(conversation as any).acheteur_email && (
                                                                        <p className="text-xs text-gray-400 mt-1 truncate">
                                                                            📧 {(conversation as any).acheteur_email}
                                                                        </p>
                                                                    )}

                                                                    {conversation.derniere_activite && (
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                                            {formatDateSafely(conversation.derniere_activite, {
                  addSuffix: true,
                  fallback: 'Récemment'
                })}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-end gap-1 ml-2">
                                                                <Badge
                                                                    variant={conversation.statut === 'ouverte' ? 'default' : 'secondary'}
                                                                    className="text-xs"
                                                                >
                                                                    {conversation.statut}
                                                                </Badge>
                                                                {conversation.priorite && conversation.priorite !== 'normale' && (
                                                                    <Badge
                                                                        variant={conversation.priorite === 'urgente' ? 'destructive' : 'secondary'}
                                                                        className="text-xs"
                                                                    >
                                                                        {conversation.priorite}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Zone de chat */}
                    <div className={`lg:col-span-8 ${!activeConversation ? 'hidden lg:block' : ''}`}>
                        {activeConversation ? (
                            <div className="p-4 text-center text-gray-500">
                                Interface fournisseur en cours de migration
                            </div>
                        ) : (
                            <Card className="h-full flex items-center justify-center">
                                <CardContent>
                                    <div className="text-center max-w-md">
                                        <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Sélectionnez une conversation
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Choisissez une conversation dans la liste pour répondre aux acheteurs
                                        </p>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-medium text-blue-900 mb-2">💡 Conseils pour les fournisseurs</h4>
                                            <ul className="text-sm text-blue-700 space-y-1 text-left">
                                                <li>• Répondez rapidement aux questions</li>
                                                <li>• Soyez précis sur vos produits</li>
                                                <li>• Proposez des échantillons si possible</li>
                                                <li>• Négociez les prix de manière professionnelle</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </SupplierLayout>
    );
};

// Composant principal avec ConversationProvider
export const SupplierMessagesPage: React.FC = () => {
    const { data: currentUser } = useCurrentUser();

    if (!currentUser) {
        return (
            <SupplierLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Connexion requise
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Vous devez être connecté pour accéder à vos messages.
                                </p>
                                <Button onClick={() => window.location.href = '/supplier/login'}>
                                    Se connecter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SupplierLayout>
        );
    }

    // Rediriger les acheteurs vers leur interface
    if (currentUser.role_id === 1) {
        window.location.href = '/messages';
        return null;
    }

    return (
        <SupplierMessagesPageContent />
    );
};

export default SupplierMessagesPage;