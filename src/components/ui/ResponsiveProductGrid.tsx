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
  
  // Configuration des colonnes par défaut
  const defaultColumns = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 5
  };
  
  const finalColumns = { ...defaultColumns, ...columns };
  
  // Classes de grille responsive
  const getGridClasses = () => {
    const classes = ['grid'];
    
    // Gap
    const gapClasses = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-4 sm:gap-6',
      lg: 'gap-6 sm:gap-8'
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
  
  // Variantes spéciales
  const getVariantClasses = () => {
    switch (variant) {
      case 'masonry':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 'fixed':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      default:
        return getGridClasses();
    }
  };
  
  return (
    <div className={cn(getVariantClasses(), className)}>
      {children}
    </div>
  );
};

export default ResponsiveProductGrid;
