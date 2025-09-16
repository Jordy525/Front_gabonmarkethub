import React, { memo } from 'react';
import { formatDateSafely } from '@/utils/dateUtils';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UnreadCounter } from './UnreadCounter';
import { ConversationContextBadge } from './ConversationContext';
import { MessageStatusIndicator } from './MessageStatusIndicator';
import { Archive, MessageCircle, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/api';

export interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = memo(({
  conversation,
  isSelected,
  onSelect,
  className = ''
}) => {
  const unreadCount = (conversation.messages_non_lus_acheteur || 0) + 
                     (conversation.messages_non_lus_fournisseur || 0);
  const hasUnread = unreadCount > 0;

  // Obtenir le nom du participant
  const getParticipantName = () => {
    return conversation.fournisseur?.nom_entreprise || 
           conversation.acheteur?.nom || 
           'Utilisateur inconnu';
  };

  // Obtenir l'avatar du participant
  const getParticipantAvatar = () => {
    return conversation.fournisseur?.logo || 
           conversation.acheteur?.nom?.charAt(0) || 
           'U';
  };

  // Obtenir l'icône de priorité
  const getPriorityIcon = () => {
    switch (conversation.priorite) {
      case 'urgente':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'haute':
        return <AlertCircle className="w-3 h-3 text-orange-500" />;
      default:
        return null;
    }
  };

  // Obtenir l'icône de contexte
  const getContextIcon = () => {
    if (conversation.produit_id) {
      return <Package className="w-3 h-3 text-blue-500" />;
    }
    if (conversation.commande_id) {
      return <ShoppingCart className="w-3 h-3 text-green-500" />;
    }
    return <MessageCircle className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div
      className={cn(
        'p-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50',
        {
          'bg-blue-50 border-blue-200': isSelected,
          'bg-blue-25': hasUnread && !isSelected
        },
        className
      )}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-10 h-10">
            <AvatarImage src={getParticipantAvatar()} />
            <AvatarFallback>
              {getParticipantName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Indicateur de statut en ligne (optionnel) */}
          {conversation.statut === 'ouverte' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Contenu de la conversation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className={cn(
                'text-sm truncate',
                hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
              )}>
                {getParticipantName()}
              </h3>
              {getPriorityIcon()}
              {getContextIcon()}
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <UnreadCounter count={unreadCount} size="sm" />
              <span className="text-xs text-gray-500">
                                {formatDateSafely(conversation.updated_at, {
                  addSuffix: true,
                  fallback: 'Récemment'
                })}
              </span>
            </div>
          </div>

          {/* Sujet de la conversation */}
          {conversation.sujet && (
            <p className={cn(
              'text-sm mb-1 truncate',
              hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
            )}>
              {conversation.sujet}
            </p>
          )}

          {/* Dernier message */}
          {conversation.dernier_message && (
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-sm text-gray-500 truncate flex-1">
                {conversation.dernier_message.contenu}
              </p>
              {conversation.dernier_message.expediteur_id && (
                <MessageStatusIndicator 
                  status={conversation.dernier_message.lu ? 'read' : 'delivered'}
                  size="sm"
                />
              )}
            </div>
          )}

          {/* Tags et contexte */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <ConversationContextBadge conversation={conversation} />
              
              {conversation.tags && conversation.tags.length > 0 && (
                <div className="flex space-x-1">
                  {conversation.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {conversation.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      +{conversation.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {conversation.archivee && (
                <Archive className="w-3 h-3 text-gray-400" />
              )}
              <div className={cn(
                'w-2 h-2 rounded-full',
                conversation.statut === 'ouverte' ? 'bg-green-400' : 'bg-gray-400'
              )} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ConversationListItem.displayName = 'ConversationListItem';