import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface UnreadCounterProps {
  count: number;
  maxCount?: number;
  variant?: 'default' | 'destructive' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showZero?: boolean;
}

export const UnreadCounter: React.FC<UnreadCounterProps> = ({
  count,
  maxCount = 99,
  variant = 'destructive',
  size = 'sm',
  className = '',
  showZero = false
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const sizeClasses = {
    sm: 'text-xs px-1 sm:px-1.5 py-0.5 min-w-[16px] sm:min-w-[18px] h-4 sm:h-5',
    md: 'text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[18px] sm:min-w-[20px] h-5 sm:h-6',
    lg: 'text-sm sm:text-base px-2 sm:px-2.5 py-1 sm:py-1.5 min-w-[20px] sm:min-w-[24px] h-6 sm:h-7'
  };

  return (
    <Badge 
      variant={variant}
      className={cn(
        'rounded-full flex items-center justify-center font-medium',
        sizeClasses[size],
        className
      )}
    >
      {displayCount}
    </Badge>
  );
};

// Composant pour un compteur flottant (comme sur les icônes)
export interface FloatingUnreadCounterProps extends UnreadCounterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const FloatingUnreadCounter: React.FC<FloatingUnreadCounterProps> = ({
  count,
  maxCount = 99,
  variant = 'destructive',
  size = 'sm',
  position = 'top-right',
  className = '',
  showZero = false
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  };

  return (
    <UnreadCounter
      count={count}
      maxCount={maxCount}
      variant={variant}
      size={size}
      className={cn(
        'absolute z-10',
        positionClasses[position],
        className
      )}
      showZero={showZero}
    />
  );
};

// Hook pour calculer les compteurs de messages non lus
export const useUnreadCounts = (conversations: any[]) => {
  return React.useMemo(() => {
    // Vérifier que conversations est défini et est un tableau
    if (!conversations || !Array.isArray(conversations)) {
      return {
        totalUnread: 0,
        unreadByConversation: {},
        priorityUnread: 0,
        hasUnread: false,
        hasPriorityUnread: false
      };
    }

    const totalUnread = conversations.reduce((total, conv) => {
      return total + (conv.messages_non_lus_acheteur || 0) + (conv.messages_non_lus_fournisseur || 0);
    }, 0);

    const unreadByConversation = conversations.reduce((acc, conv) => {
      const unreadCount = (conv.messages_non_lus_acheteur || 0) + (conv.messages_non_lus_fournisseur || 0);
      if (unreadCount > 0) {
        acc[conv.id] = unreadCount;
      }
      return acc;
    }, {} as Record<number, number>);

    const priorityUnread = conversations.reduce((total, conv) => {
      if (conv.priorite === 'haute' || conv.priorite === 'urgente') {
        return total + (conv.messages_non_lus_acheteur || 0) + (conv.messages_non_lus_fournisseur || 0);
      }
      return total;
    }, 0);

    return {
      totalUnread,
      unreadByConversation,
      priorityUnread,
      hasUnread: totalUnread > 0,
      hasPriorityUnread: priorityUnread > 0
    };
  }, [conversations]);
};