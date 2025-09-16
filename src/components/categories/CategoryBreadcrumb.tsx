import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface CategoryBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const CategoryBreadcrumb = ({ items }: CategoryBreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link 
        to="/" 
        className="flex items-center hover:text-green-600 transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Accueil
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link 
              to={item.href}
              className="hover:text-green-600 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default CategoryBreadcrumb;