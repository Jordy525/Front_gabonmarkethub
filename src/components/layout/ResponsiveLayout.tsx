import { ReactNode } from "react";
import ResponsiveHeader from "./ResponsiveHeader";
import ResponsiveFooter from "./ResponsiveFooter";
import { RESPONSIVE_CLASSES } from "@/config/responsive";

interface ResponsiveLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const ResponsiveLayout = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  className = ""
}: ResponsiveLayoutProps) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {showHeader && <ResponsiveHeader />}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <ResponsiveFooter />}
    </div>
  );
};

export default ResponsiveLayout;

