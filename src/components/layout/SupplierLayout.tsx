import { ReactNode } from "react";
import SupplierHeader from "./SupplierHeader";
import Footer from "./Footer";

interface SupplierLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const SupplierLayout = ({ children, showHeader = true, showFooter = true }: SupplierLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <SupplierHeader />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default SupplierLayout;