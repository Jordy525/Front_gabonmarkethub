import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SimpleCategorySidebar from './SimpleCategorySidebar';

interface Props {
  children?: ReactNode;
  onCategorySelect?: (categorySlug: string) => void;
  currentCategory?: string;
  showSearch?: boolean;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class CategorySidebarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('CategorySidebar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`bg-white rounded-lg shadow-sm p-6 ${this.props.className}`}>
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Impossible de charger les filtres de catégories
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface CategorySidebarWrapperProps {
  onCategorySelect?: (categorySlug: string) => void;
  currentCategory?: string;
  showSearch?: boolean;
  className?: string;
}

export const CategorySidebarWrapper = (props: CategorySidebarWrapperProps) => {
  return (
    <CategorySidebarErrorBoundary {...props}>
      <SimpleCategorySidebar {...props} />
    </CategorySidebarErrorBoundary>
  );
};

export default CategorySidebarWrapper;