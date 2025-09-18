import { ReactNode } from "react";
import { RESPONSIVE_CLASSES } from "@/config/responsive";
import { cn } from "@/lib/utils";

interface ResponsiveFormProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'wide';
  columns?: 1 | 2 | 3;
}

const ResponsiveForm = ({
  children,
  className,
  variant = 'default',
  columns = 1
}: ResponsiveFormProps) => {
  const getFormClasses = () => {
    const baseClasses = ['space-y-4 sm:space-y-6'];
    
    switch (variant) {
      case 'compact':
        return [...baseClasses, 'max-w-md mx-auto'];
      case 'wide':
        return [...baseClasses, 'max-w-4xl mx-auto'];
      default:
        return [...baseClasses, 'max-w-lg mx-auto'];
    }
  };
  
  const getGridClasses = () => {
    if (columns === 1) return '';
    
    const gridClasses = ['grid'];
    
    switch (columns) {
      case 2:
        gridClasses.push('grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6');
        break;
      case 3:
        gridClasses.push('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6');
        break;
    }
    
    return gridClasses.join(' ');
  };
  
  return (
    <form className={cn(getFormClasses().join(' '), className)}>
      <div className={getGridClasses()}>
        {children}
      </div>
    </form>
  );
};

interface ResponsiveFormFieldProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const ResponsiveFormField = ({
  children,
  className,
  fullWidth = false
}: ResponsiveFormFieldProps) => {
  return (
    <div className={cn(
      fullWidth ? 'col-span-full' : 'col-span-1',
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveForm;

