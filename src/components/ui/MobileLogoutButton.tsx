import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MobileLogoutButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  variant?: 'button' | 'dropdown';
  className?: string;
}

/**
 * Composant de bouton de déconnexion optimisé pour mobile
 */
export const MobileLogoutButton: React.FC<MobileLogoutButtonProps> = ({
  onClick,
  isLoading = false,
  variant = 'button',
  className = ''
}) => {
  const baseClasses = "text-red-600 hover:bg-red-50 min-h-[44px] touch-target";
  const content = (
    <>
      <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
      <span className="truncate">
        {isLoading ? 'Déconnexion...' : 'Se déconnecter'}
      </span>
    </>
  );

  if (variant === 'dropdown') {
    return (
      <DropdownMenuItem
        onClick={onClick}
        disabled={isLoading}
        className={cn(baseClasses, className)}
      >
        {content}
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        baseClasses,
        "justify-start w-full",
        className
      )}
    >
      {content}
    </Button>
  );
};

/**
 * Composant de bouton de déconnexion pour la sidebar de profil
 */
export const ProfileLogoutButton: React.FC<{
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}> = ({ onClick, isLoading = false, className = '' }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200",
        "min-h-[44px] touch-target text-sm",
        className
      )}
      onClick={onClick}
      disabled={isLoading}
    >
      <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
      <span className="truncate">
        {isLoading ? "Déconnexion..." : "Se déconnecter"}
      </span>
    </Button>
  );
};

export default MobileLogoutButton;