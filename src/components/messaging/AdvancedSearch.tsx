import React, { useState, useCallback } from 'react';
import { Search, Filter, X, Calendar, User, Package, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ConversationFilters } from '@/types/api';

export interface AdvancedSearchProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: ConversationFilters) => void;
  currentFilters: ConversationFilters;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onFiltersChange,
  currentFilters,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  // Gérer la recherche
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    onSearch(value);
  }, [onSearch]);

  // Gérer les changements de filtres
  const handleFilterChange = useCallback((key: keyof ConversationFilters, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFiltersChange(newFilters);
  }, [currentFilters, onFiltersChange]);

  // Supprimer un filtre
  const removeFilter = useCallback((key: keyof ConversationFilters) => {
    const newFilters = { ...currentFilters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  }, [currentFilters, onFiltersChange]);

  // Réinitialiser tous les filtres
  const clearAllFilters = useCallback(() => {
    onFiltersChange({});
    setDateRange({});
  }, [onFiltersChange]);

  // Compter les filtres actifs
  const activeFiltersCount = Object.keys(currentFilters).filter(key => 
    currentFilters[key as keyof ConversationFilters] !== undefined
  ).length;

  // Obtenir les badges des filtres actifs
  const getActiveFilterBadges = () => {
    const badges = [];

    if (currentFilters.statut) {
      badges.push(
        <Badge key="statut" variant="secondary" className="text-xs">
          Statut: {currentFilters.statut}
          <X 
            className="w-3 h-3 ml-1 cursor-pointer" 
            onClick={() => removeFilter('statut')}
          />
        </Badge>
      );
    }

    if (currentFilters.priorite) {
      badges.push(
        <Badge key="priorite" variant="secondary" className="text-xs">
          Priorité: {currentFilters.priorite}
          <X 
            className="w-3 h-3 ml-1 cursor-pointer" 
            onClick={() => removeFilter('priorite')}
          />
        </Badge>
      );
    }

    if (currentFilters.archivee !== undefined) {
      badges.push(
        <Badge key="archivee" variant="secondary" className="text-xs">
          {currentFilters.archivee ? 'Archivées' : 'Non archivées'}
          <X 
            className="w-3 h-3 ml-1 cursor-pointer" 
            onClick={() => removeFilter('archivee')}
          />
        </Badge>
      );
    }

    if (currentFilters.produit_id) {
      badges.push(
        <Badge key="produit" variant="secondary" className="text-xs">
          <Package className="w-3 h-3 mr-1" />
          Produit
          <X 
            className="w-3 h-3 ml-1 cursor-pointer" 
            onClick={() => removeFilter('produit_id')}
          />
        </Badge>
      );
    }

    if (currentFilters.commande_id) {
      badges.push(
        <Badge key="commande" variant="secondary" className="text-xs">
          <ShoppingCart className="w-3 h-3 mr-1" />
          Commande
          <X 
            className="w-3 h-3 ml-1 cursor-pointer" 
            onClick={() => removeFilter('commande_id')}
          />
        </Badge>
      );
    }

    return badges;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre de recherche principale */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher dans les conversations..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs min-w-[18px] h-5"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtres avancés</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Tout effacer
                  </Button>
                )}
              </div>

              {/* Filtre par statut */}
              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select
                  value={currentFilters.statut || ''}
                  onValueChange={(value) => handleFilterChange('statut', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="ouverte">Ouvertes</SelectItem>
                    <SelectItem value="fermee">Fermées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par priorité */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priorité</label>
                <Select
                  value={currentFilters.priorite || ''}
                  onValueChange={(value) => handleFilterChange('priorite', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les priorités</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre archivé */}
              <div>
                <label className="text-sm font-medium mb-2 block">Archive</label>
                <Select
                  value={currentFilters.archivee?.toString() || ''}
                  onValueChange={(value) => 
                    handleFilterChange('archivee', value === '' ? undefined : value === 'true')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les conversations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les conversations</SelectItem>
                    <SelectItem value="false">Non archivées</SelectItem>
                    <SelectItem value="true">Archivées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par date */}
              <div>
                <label className="text-sm font-medium mb-2 block">Période</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: fr }) : 'Du'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy', { locale: fr }) : 'Au'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Badges des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {getActiveFilterBadges()}
        </div>
      )}
    </div>
  );
};