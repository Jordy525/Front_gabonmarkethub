import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center hover:text-green-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <button
              onClick={() => navigate(item.href!)}
              className="hover:text-green-600 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};