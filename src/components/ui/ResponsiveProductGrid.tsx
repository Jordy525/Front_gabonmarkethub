import { ReactNode } from "react";
import { RESPONSIVE_CLASSES, useBreakpoint } from "@/config/responsive";
import { cn } from "@/lib/utils";

interface ResponsiveProductGridProps {
  children: ReactNode;
  className?: string;
  variant?: 'auto' | 'fixed' | 'masonry';
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const ResponsiveProductGrid = ({
  children,
  className,
  variant = 'auto',
  columns,
  gap = 'md'
}: ResponsiveProductGridProps) => {
  const breakpoint = useBreakpoint();
  
  // Configuration des colonnes par défaut - OPTIMISÉ MOBILE
  const defaultColumns = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4
  };
  
  const finalColumns = { ...defaultColumns, ...columns };
  
  // Classes de grille responsive
  const getGridClasses = () => {
    const classes = ['grid'];
    
    // Gap - RÉDUIT pour mobile
    const gapClasses = {
      sm: 'gap-1 sm:gap-2',
      md: 'gap-2 sm:gap-3 lg:gap-4',
      lg: 'gap-3 sm:gap-4 lg:gap-6'
    };
    classes.push(gapClasses[gap]);
    
    // Colonnes responsive
    if (finalColumns.xs) classes.push(`grid-cols-${finalColumns.xs}`);
    if (finalColumns.sm) classes.push(`sm:grid-cols-${finalColumns.sm}`);
    if (finalColumns.md) classes.push(`md:grid-cols-${finalColumns.md}`);
    if (finalColumns.lg) classes.push(`lg:grid-cols-${finalColumns.lg}`);
    if (finalColumns.xl) classes.push(`xl:grid-cols-${finalColumns.xl}`);
    if (finalColumns['2xl']) classes.push(`2xl:grid-cols-${finalColumns['2xl']}`);
    
    return classes.join(' ');
  };
  
  // Variantes spéciales - OPTIMISÉ MOBILE
  const getVariantClasses = () => {
    switch (variant) {
      case 'masonry':
        return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 space-y-2 sm:space-y-4';
      case 'fixed':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4';
      default:
        return getGridClasses();
    }
  };
  
  return (
    <div className={cn(
      getVariantClasses(),
      // Optimisations pour mobile
      'w-full',
      variant === 'auto' && 'auto-rows-min',
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveProductGrid;

