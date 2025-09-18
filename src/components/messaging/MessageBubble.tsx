import React from 'react';
import { formatMessageTime } from '@/utils/dateUtils';
import { Check, CheckCheck, Clock } from 'lucide-react';
import type { Message } from '@/types/messaging';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
  showSenderName: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  senderName,
  showSenderName
}) => {
  const getStatusIcon = () => {
    if (message.lu) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    return <Check className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 group`}>
      <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md relative ${
        isOwn 
          ? 'order-2' 
          : 'order-1'
      }`}>
        {/* Nom de l'expéditeur */}
        {!isOwn && showSenderName && (
          <div className="mb-1 ml-1 sm:ml-2">
            <span className="text-xs font-medium text-muted-foreground truncate">
              {senderName}
            </span>
          </div>
        )}

        {/* Bulle de message */}
        <div className={`
          relative px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm transition-all duration-200
          ${isOwn 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md' 
            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 rounded-bl-md border border-gray-200'
          }
          group-hover:shadow-md
        `}>
          {/* Contenu du message */}
          <p className="text-xs sm:text-sm leading-relaxed break-words">
            {message.contenu}
          </p>

          {/* Indicateurs de statut et heure */}
          <div className={`
            flex items-center justify-end gap-1 sm:gap-2 mt-1 sm:mt-2 pt-1 sm:pt-2
            ${isOwn 
              ? 'border-t border-blue-400/30' 
              : 'border-t border-gray-200'
            }
          `}>
            {/* Heure */}
            <span className={`
              text-xs
              ${isOwn ? 'text-blue-100' : 'text-gray-500'}
            `}>
              {formatMessageTime(message.created_at)}
            </span>

            {/* Statut de lecture (seulement pour nos messages) */}
            {isOwn && (
              <div className="flex items-center gap-1">
                {getStatusIcon()}
              </div>
            )}
          </div>

          {/* Indicateur de frappe (optionnel) */}
          {message.isTyping && (
            <div className="absolute -bottom-6 left-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>en train d'écrire...</span>
              </div>
            </div>
          )}
        </div>

        {/* Avatar/Icone */}
        <div className={`
          w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium flex-shrink-0
          ${isOwn 
            ? 'order-1 ml-1 sm:ml-2 bg-gradient-to-br from-blue-400 to-blue-500' 
            : 'order-2 mr-1 sm:mr-2 bg-gradient-to-br from-gray-400 to-gray-500'
          }
        `}>
          <span className="hidden sm:inline">{isOwn ? 'Vous' : senderName.charAt(0).toUpperCase()}</span>
          <span className="sm:hidden">{isOwn ? 'V' : senderName.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
