import React from 'react';
import { cn } from '@/lib/utils';

export interface TypingIndicatorProps {
  typingUsers: number[];
  getUserName?: (userId: number) => string;
  className?: string;
  maxDisplayUsers?: number;
  showAnimation?: boolean;
}

/**
 * Composant pour afficher les indicateurs "en train d'écrire"
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  getUserName = (userId) => `Utilisateur ${userId}`,
  className = '',
  maxDisplayUsers = 3,
  showAnimation = true
}) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const displayUsers = typingUsers.slice(0, maxDisplayUsers);
  const remainingCount = typingUsers.length - maxDisplayUsers;

  const formatTypingText = () => {
    if (displayUsers.length === 1) {
      return `${getUserName(displayUsers[0])} est en train d'écrire`;
    } else if (displayUsers.length === 2) {
      return `${getUserName(displayUsers[0])} et ${getUserName(displayUsers[1])} sont en train d'écrire`;
    } else if (displayUsers.length === 3 && remainingCount === 0) {
      return `${getUserName(displayUsers[0])}, ${getUserName(displayUsers[1])} et ${getUserName(displayUsers[2])} sont en train d'écrire`;
    } else {
      const names = displayUsers.map(getUserName).join(', ');
      if (remainingCount > 0) {
        return `${names} et ${remainingCount} autre${remainingCount > 1 ? 's' : ''} sont en train d'écrire`;
      }
      return `${names} sont en train d'écrire`;
    }
  };

  return (
    <div className={cn(
      'flex items-center space-x-2 text-sm text-gray-500 px-3 py-2',
      className
    )}>
      {showAnimation && (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
      <span className="italic">
        {formatTypingText()}...
      </span>
    </div>
  );
};

/**
 * Version compacte de l'indicateur de frappe
 */
export const CompactTypingIndicator: React.FC<{
  typingUsers: number[];
  className?: string;
}> = ({ typingUsers, className = '' }) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'flex items-center space-x-1 text-xs text-gray-400',
      className
    )}>
      <div className="flex space-x-0.5">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {typingUsers.length === 1 ? 'En train d\'écrire' : `${typingUsers.length} en train d'écrire`}
      </span>
    </div>
  );
};

/**
 * Indicateur de frappe avec avatars
 */
export const AvatarTypingIndicator: React.FC<{
  typingUsers: { id: number; name: string; avatar?: string }[];
  className?: string;
}> = ({ typingUsers, className = '' }) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg',
      className
    )}>
      <div className="flex -space-x-1">
        {typingUsers.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
            title={user.name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
        ))}
        {typingUsers.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
            +{typingUsers.length - 3}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <div className="flex space-x-0.5">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-gray-500 italic">
          {typingUsers.length === 1 
            ? `${typingUsers[0].name} est en train d'écrire` 
            : `${typingUsers.length} personnes écrivent`
          }...
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;