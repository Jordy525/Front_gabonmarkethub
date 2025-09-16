import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showText?: boolean;
  text?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className,
  onClick,
  showText = true,
  text = 'GabMarketHub'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div 
      className={cn(
        'flex items-center space-x-2',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Image du logo */}
      <img
        src="/images/logo.png"
        alt="GabMarketHub Logo"
        className={cn(
          sizeClasses[size],
          'object-contain'
        )}
      />

      {/* Texte du logo */}
      {showText && (
        <span className={cn(
          textSizeClasses[size],
          'font-bold text-gray-900'
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Logo;