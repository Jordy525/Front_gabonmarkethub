import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FilterSection {
  id: string;
  title: string;
  type: 'select' | 'checkbox' | 'range' | 'radio';
  options?: Array<{ value: string; label: string; count?: number }>;
  value?: any;
  min?: number;
  max?: number;
  step?: number;
}

interface MobileFilterDrawerProps {
  filters: FilterSection[];
  onFilterChange: (filterId: string, value: any) => void;
  onClearAll: () => void;
  activeFiltersCount?: number;
  className?: string;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  activeFiltersCount = 0,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['category', 'price']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderFilterSection = (filter: FilterSection) => {
    const isExpanded = expandedSections.has(filter.id);

    return (
      <div key={filter.id} className="space-y-3">
        <button
          onClick={() => toggleSection(filter.id)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-medium text-sm">{filter.title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-2">
            {filter.type === 'select' && (
              <Select
                value={filter.value || 'all'}
                onValueChange={(value) => onFilterChange(filter.id, value)}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {option.count && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {option.count}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filter.type === 'checkbox' && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filter.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${filter.id}-${option.value}`}
                      checked={Array.isArray(filter.value) && filter.value.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(filter.value) ? filter.value : [];
                        if (checked) {
                          onFilterChange(filter.id, [...currentValues, option.value]);
                        } else {
                          onFilterChange(filter.id, currentValues.filter((v: string) => v !== option.value));
                        }
                      }}
                    />
                    <label
                      htmlFor={`${filter.id}-${option.value}`}
                      className="text-sm flex-1 flex items-center justify-between cursor-pointer"
                    >
                      <span>{option.label}</span>
                      {option.count && (
                        <Badge variant="outline" className="text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {filter.type === 'range' && (
              <div className="space-y-3">
                <div className="px-2">
                  <Slider
                    value={filter.value || [filter.min || 0, filter.max || 100]}
                    onValueChange={(value) => onFilterChange(filter.id, value)}
                    min={filter.min || 0}
                    max={filter.max || 100}
                    step={filter.step || 1}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{filter.value?.[0] || filter.min || 0} FCFA</span>
                  <span>{filter.value?.[1] || filter.max || 100} FCFA</span>
                </div>
              </div>
            )}

            {filter.type === 'radio' && (
              <div className="space-y-2">
                {filter.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`${filter.id}-${option.value}`}
                      name={filter.id}
                      value={option.value}
                      checked={filter.value === option.value}
                      onChange={() => onFilterChange(filter.id, option.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <label
                      htmlFor={`${filter.id}-${option.value}`}
                      className="text-sm flex-1 flex items-center justify-between cursor-pointer"
                    >
                      <span>{option.label}</span>
                      {option.count && (
                        <Badge variant="outline" className="text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("relative", className)}
        >
          <Filter className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Filtres</span>
          <span className="sm:hidden">🔍</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full sm:w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Filtres</SheetTitle>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Tout effacer
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {filters.map(renderFilterSection)}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Appliquer les filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterDrawer;