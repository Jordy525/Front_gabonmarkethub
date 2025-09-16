import React from 'react';
import { User } from 'lucide-react';
import { getImageUrl } from '@/config/constants';

interface ProfileAvatarProps {
  photoUrl?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10'
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  photoUrl,
  name,
  size = 'md',
  className = '',
  showFallback = true
}) => {
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];
  
  // Générer les initiales du nom
  const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
      {photoUrl ? (
        <img
          src={getImageUrl(photoUrl)}
          alt={name ? `Photo de ${name}` : 'Photo de profil'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // En cas d'erreur de chargement, afficher les initiales
            if (showFallback) {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }
          }}
        />
      ) : null}
      
      {showFallback && (
        <div className={`${photoUrl ? 'hidden' : ''} flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold`}>
          {name ? (
            <span className="text-xs font-bold">
              {getInitials(name)}
            </span>
          ) : (
            <User className={iconSize} />
          )}
        </div>
      )}
    </div>
  );
};
