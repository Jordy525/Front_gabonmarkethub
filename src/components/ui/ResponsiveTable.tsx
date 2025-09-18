import { ReactNode } from "react";
import { RESPONSIVE_CLASSES } from "@/config/responsive";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'striped';
  scrollable?: boolean;
}

const ResponsiveTable = ({
  children,
  className,
  variant = 'default',
  scrollable = true
}: ResponsiveTableProps) => {
  const getTableClasses = () => {
    const baseClasses = ['min-w-full divide-y divide-gray-200'];
    
    switch (variant) {
      case 'compact':
        return [...baseClasses, 'text-sm'];
      case 'striped':
        return [...baseClasses, 'bg-white'];
      default:
        return baseClasses;
    }
  };
  
  const containerClasses = scrollable 
    ? 'overflow-x-auto -mx-4 sm:mx-0'
    : 'overflow-hidden';
  
  return (
    <div className={cn(containerClasses, className)}>
      <div className="inline-block min-w-full align-middle">
        <table className={cn(getTableClasses().join(' '))}>
          {children}
        </table>
      </div>
    </div>
  );
};

interface ResponsiveTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveTableHeader = ({
  children,
  className
}: ResponsiveTableHeaderProps) => {
  return (
    <thead className={cn("bg-gray-50", className)}>
      {children}
    </thead>
  );
};

interface ResponsiveTableBodyProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveTableBody = ({
  children,
  className
}: ResponsiveTableBodyProps) => {
  return (
    <tbody className={cn("bg-white divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  );
};

interface ResponsiveTableRowProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const ResponsiveTableRow = ({
  children,
  className,
  hover = true
}: ResponsiveTableRowProps) => {
  return (
    <tr className={cn(
      hover && "hover:bg-gray-50",
      className
    )}>
      {children}
    </tr>
  );
};

interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
  align?: 'left' | 'center' | 'right';
}

export const ResponsiveTableCell = ({
  children,
  className,
  header = false,
  align = 'left'
}: ResponsiveTableCellProps) => {
  const Component = header ? 'th' : 'td';
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <Component
      className={cn(
        "px-3 py-2 sm:px-6 sm:py-4 text-sm",
        header ? "font-medium text-gray-900" : "text-gray-500",
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </Component>
  );
};

export default ResponsiveTable;
