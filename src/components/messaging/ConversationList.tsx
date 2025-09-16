import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  User, 
  Building2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { formatDateSafely } from '@/utils/dateUtils';
import type { Conversation } from '@/types/messaging';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId?: number;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId
}) => {
  const getOtherPartyName = (conversation: Conversation) => {
    if (currentUserId === conversation.acheteur_id) {
      // L'utilisateur actuel est l'acheteur, afficher le fournisseur
      return conversation.nom_entreprise || 
             `${conversation.fournisseur_prenom} ${conversation.fournisseur_nom}`.trim();
    } else {
      // L'utilisateur actuel est le fournisseur, afficher l'acheteur
      return `${conversation.acheteur_prenom} ${conversation.acheteur_nom}`.trim();
    }
  };

  const getOtherPartyIcon = (conversation: Conversation) => {
    if (currentUserId === conversation.acheteur_id) {
      // L'utilisateur actuel est l'acheteur, l'autre est un fournisseur
      return conversation.nom_entreprise ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />;
    } else {
      // L'utilisateur actuel est le fournisseur, l'autre est un acheteur
      return <User className="h-4 w-4" />;
    }
  };

  const getUnreadCount = (conversation: Conversation) => {
    if (currentUserId === conversation.acheteur_id) {
      return conversation.messages_non_lus_acheteur || 0;
    } else {
      return conversation.messages_non_lus_fournisseur || 0;
    }
  };

  const getLastActivity = (conversation: Conversation) => {
    // Utiliser la fonction utilitaire sécurisée avec formatage intelligent
    return formatDateSafely(conversation.derniere_activite || conversation.updated_at, {
      addSuffix: true,
      fallback: 'Récemment',
      format: 'relative'
    });
  };

  const getStatusIcon = (conversation: Conversation) => {
    if (conversation.statut === 'fermee') {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <MessageCircle className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.id === conversation.id;
        const unreadCount = getUnreadCount(conversation);
        const otherPartyName = getOtherPartyName(conversation);
        const lastActivity = getLastActivity(conversation);

        return (
          <div
            key={conversation.id}
            className={`
              p-4 cursor-pointer transition-colors hover:bg-muted/50
              ${isSelected ? 'bg-primary/10 border-r-2 border-primary' : ''}
            `}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-start gap-3">
              {/* Avatar/Icon */}
              <div className="flex-shrink-0">
                <div className={`
                  h-10 w-10 rounded-full flex items-center justify-center
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  {getOtherPartyIcon(conversation)}
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`
                    font-medium text-sm truncate
                    ${unreadCount > 0 ? 'font-semibold' : ''}
                  `}>
                    {otherPartyName}
                  </h4>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(conversation)}
                    <span className="text-xs text-muted-foreground">
                      {lastActivity}
                    </span>
                  </div>
                </div>

                {/* Sujet */}
                {conversation.sujet && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {conversation.sujet}
                  </p>
                )}

                {/* Dernier message */}
                {conversation.dernier_message && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {conversation.dernier_message}
                  </p>
                )}

                {/* Métadonnées */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Badge statut */}
                    <Badge 
                      variant={conversation.statut === 'fermee' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {conversation.statut === 'fermee' ? 'Fermée' : 'Active'}
                    </Badge>

                    {/* Badge priorité si définie */}
                    {conversation.priorite && conversation.priorite !== 'normale' && (
                      <Badge 
                        variant={conversation.priorite === 'urgente' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {conversation.priorite === 'urgente' ? 'Urgente' : 'Haute'}
                      </Badge>
                    )}
                  </div>

                  {/* Compteur de messages non lus */}
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};