import React from 'react';
import { Package, ShoppingCart, MessageCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Conversation, Product, Order } from '@/types/api';

export interface ConversationContextProps {
  conversation: Conversation;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

export const ConversationContext: React.FC<ConversationContextProps> = ({
  conversation,
  className = '',
  showActions = true,
  compact = false
}) => {
  const hasProduct = conversation.produit_id && conversation.produit;
  const hasOrder = conversation.commande_id && conversation.commande;
  const hasContext = hasProduct || hasOrder;

  if (!hasContext) {
    return (
      <div className={cn('flex items-center space-x-2 text-sm text-gray-500', className)}>
        <MessageCircle className="w-4 h-4" />
        <span>Conversation générale</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {hasProduct && (
          <div className="flex items-center space-x-1 text-sm text-blue-600">
            <Package className="w-3 h-3" />
            <span className="truncate max-w-[150px]">{conversation.produit?.nom}</span>
          </div>
        )}
        {hasOrder && (
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <ShoppingCart className="w-3 h-3" />
            <span>#{conversation.commande?.numero_commande}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('border-l-4', className, {
      'border-l-blue-500': hasProduct,
      'border-l-green-500': hasOrder
    })}>
      <CardContent className="p-4">
        {hasProduct && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Produit concerné</span>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Produit
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">
                {conversation.produit?.nom}
              </h4>
              
              {conversation.produit?.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {conversation.produit.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Prix: <span className="font-medium">{conversation.produit?.prix_unitaire}€</span>
                  {conversation.produit?.moq && (
                    <span className="ml-2">MOQ: {conversation.produit.moq}</span>
                  )}
                </div>
                
                {showActions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/products/${conversation.produit?.id}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Voir le produit
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {hasOrder && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Commande concernée</span>
              </div>
              <Badge 
                variant="outline" 
                className={cn('border-green-200', {
                  'text-green-600': conversation.commande?.statut === 'livree',
                  'text-blue-600': conversation.commande?.statut === 'expediee',
                  'text-orange-600': conversation.commande?.statut === 'preparee',
                  'text-gray-600': conversation.commande?.statut === 'en_attente'
                })}
              >
                {conversation.commande?.statut}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">
                Commande #{conversation.commande?.numero_commande}
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium ml-1">{conversation.commande?.total_ttc}€</span>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-1">
                    {conversation.commande?.date_commande && 
                      new Date(conversation.commande.date_commande).toLocaleDateString('fr-FR')
                    }
                  </span>
                </div>
              </div>
              
              {conversation.commande?.date_livraison_prevue && (
                <div className="text-sm">
                  <span className="text-gray-500">Livraison prévue:</span>
                  <span className="ml-1">
                    {new Date(conversation.commande.date_livraison_prevue).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              
              {showActions && (
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/orders/${conversation.commande?.id}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Voir la commande
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant pour afficher le contexte dans la liste des conversations
export interface ConversationContextBadgeProps {
  conversation: Conversation;
  className?: string;
}

export const ConversationContextBadge: React.FC<ConversationContextBadgeProps> = ({
  conversation,
  className = ''
}) => {
  const hasProduct = conversation.produit_id && conversation.produit;
  const hasOrder = conversation.commande_id && conversation.commande;

  if (!hasProduct && !hasOrder) {
    return null;
  }

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {hasProduct && (
        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
          <Package className="w-3 h-3 mr-1" />
          Produit
        </Badge>
      )}
      {hasOrder && (
        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
          <ShoppingCart className="w-3 h-3 mr-1" />
          Commande
        </Badge>
      )}
    </div>
  );
};

// Hook pour créer des conversations contextuelles
export const useContextualConversation = () => {
  const createProductConversation = (productId: number, supplierId: number, productName?: string) => {
    return {
      fournisseur_id: supplierId,
      produit_id: productId,
      sujet: productName ? `À propos de "${productName}"` : 'Question sur le produit',
      priorite: 'normale' as const,
      tags: ['produit']
    };
  };

  const createOrderConversation = (orderId: number, supplierId: number, orderNumber?: string) => {
    return {
      fournisseur_id: supplierId,
      commande_id: orderId,
      sujet: orderNumber ? `Commande ${orderNumber}` : 'Question sur la commande',
      priorite: 'haute' as const,
      tags: ['commande', 'suivi']
    };
  };

  return {
    createProductConversation,
    createOrderConversation
  };
};