import { ReactNode } from "react";
import ResponsiveLayout from "./ResponsiveLayout";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const Layout = ({ children, showHeader = true, showFooter = true, className }: LayoutProps) => {
  return (
    <ResponsiveLayout 
      showHeader={showHeader} 
      showFooter={showFooter}
      className={className}
    >
      {children}
    </ResponsiveLayout>
  );
};

export default Layout;
