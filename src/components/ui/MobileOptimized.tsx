import React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/config/responsive';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  compactOnMobile?: boolean;
  fullHeightOnMobile?: boolean;
}

/**
 * Composant wrapper pour optimiser automatiquement le contenu sur mobile
 */
export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className = '',
  mobileClassName = '',
  desktopClassName = '',
  compactOnMobile = false,
  fullHeightOnMobile = false
}) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';

  const classes = cn(
    className,
    isMobile ? mobileClassName : desktopClassName,
    compactOnMobile && isMobile && 'mobile-compact',
    fullHeightOnMobile && isMobile && 'mobile-height-fix'
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

/**
 * Composant pour les boutons optimisés mobile
 */
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';

  const baseClasses = 'touch-target transition-colors font-medium rounded-lg';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const sizeClasses = {
    sm: isMobile ? 'px-3 py-2 text-sm' : 'px-2 py-1 text-xs',
    md: isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm',
    lg: isMobile ? 'px-6 py-4 text-lg' : 'px-4 py-3 text-base'
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    isMobile && 'mobile-button',
    className
  );

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

/**
 * Composant pour les cards optimisées mobile
 */
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  compact = false,
  padding = 'md'
}) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';

  const paddingClasses = {
    none: '',
    sm: isMobile ? 'p-2' : 'p-3',
    md: isMobile ? 'p-3' : 'p-4',
    lg: isMobile ? 'p-4' : 'p-6'
  };

  const classes = cn(
    'bg-white rounded-lg border border-gray-200 shadow-sm',
    paddingClasses[padding],
    compact && isMobile && 'card-mobile',
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

/**
 * Composant pour les grilles optimisées mobile
 */
interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  className = '',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  };

  const classes = cn(
    'grid',
    `grid-cols-${columns.mobile}`,
    `sm:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    gapClasses[gap],
    'product-grid-mobile',
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

/**
 * Composant pour les textes optimisés mobile
 */
interface MobileTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted';
}

export const MobileText: React.FC<MobileTextProps> = ({
  children,
  className = '',
  size = 'base',
  weight = 'normal',
  color = 'primary'
}) => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';

  const sizeClasses = {
    xs: isMobile ? 'text-xs' : 'text-xs',
    sm: isMobile ? 'text-sm' : 'text-sm',
    base: isMobile ? 'text-sm' : 'text-base',
    lg: isMobile ? 'text-base' : 'text-lg',
    xl: isMobile ? 'text-lg' : 'text-xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500'
  };

  const classes = cn(
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    isMobile && 'text-mobile',
    className
  );

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default MobileOptimized;