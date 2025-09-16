import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface CategoryFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  availableFilters?: FilterOption[];
  totalResults: number;
}

const sortOptions = [
  { value: 'name', label: 'Nom (A-Z)' },
  { value: 'name-desc', label: 'Nom (Z-A)' },
  { value: 'subcategories', label: 'Plus de sous-catégories' },
  { value: 'products', label: 'Plus de produits' },
];

export const CategoryFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedFilters,
  onFilterChange,
  availableFilters = [],
  totalResults
}: CategoryFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleFilterToggle = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(f => f !== filterId)
      : [...selectedFilters, filterId];
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange([]);
    onSearchChange('');
  };

  const getCurrentSortLabel = () => {
    return sortOptions.find(option => option.value === sortBy)?.label || 'Trier par';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* Barre de recherche principale */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Boutons de contrôle */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {selectedFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {selectedFilters.length}
              </Badge>
            )}
          </Button>
          
          {/* Dropdown de tri */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center"
            >
              {getCurrentSortLabel()}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                      sortBy === option.value ? 'bg-green-50 text-green-600' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtres par type */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Type de catégorie</h4>
              <div className="space-y-2">
                {[
                  { id: 'with-subcategories', label: 'Avec sous-catégories' },
                  { id: 'leaf-categories', label: 'Catégories finales' },
                  { id: 'popular', label: 'Populaires' }
                ].map((filter) => (
                  <label key={filter.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(filter.id)}
                      onChange={() => handleFilterToggle(filter.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtres personnalisés */}
            {availableFilters.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Secteurs</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableFilters.map((filter) => (
                    <label key={filter.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(filter.id)}
                        onChange={() => handleFilterToggle(filter.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex-1">
                        {filter.label}
                      </span>
                      {filter.count && (
                        <span className="text-xs text-gray-500">({filter.count})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="mb-2"
              >
                <X className="w-4 h-4 mr-2" />
                Effacer tout
              </Button>
              <div className="text-sm text-gray-600">
                {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres actifs */}
      {(selectedFilters.length > 0 || searchTerm) && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center">
              Recherche: "{searchTerm}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {selectedFilters.map((filterId) => {
            const filter = availableFilters.find(f => f.id === filterId) || 
                          { id: filterId, label: filterId };
            return (
              <Badge key={filterId} variant="secondary" className="flex items-center">
                {filter.label}
                <button
                  onClick={() => handleFilterToggle(filterId)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryFilters;