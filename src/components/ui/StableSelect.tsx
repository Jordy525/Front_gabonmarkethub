import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface StableSelectProps {
  value?: string | null | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ id: any; nom: string; [key: string]: any }>;
  disabled?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  keyPrefix?: string;
}

/**
 * StableSelect - Un composant Select qui évite les erreurs DOM en stabilisant les données
 * pendant que le Select est ouvert
 */
export const StableSelect: React.FC<StableSelectProps> = ({
  value,
  onValueChange,
  placeholder,
  options = [],
  disabled = false,
  loadingMessage = "Chargement...",
  emptyMessage = "Aucune option disponible",
  keyPrefix = "option"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stableOptions, setStableOptions] = useState(options);
  const previousOptionsRef = useRef(options);

  // Stabiliser les options : ne les mettre à jour que si le Select est fermé
  useEffect(() => {
    if (!isOpen) {
      // Valider et nettoyer les options
      const validOptions = options.filter(option => 
        option && 
        option.id !== null && 
        option.id !== undefined && 
        option.nom && 
        typeof option.nom === 'string'
      );
      
      setStableOptions(validOptions);
      previousOptionsRef.current = validOptions;
    }
  }, [options, isOpen]);

  // S'assurer que la valeur est toujours une string
  const safeValue = value?.toString() || "";

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // Si on ferme le Select et que les options ont changé, les mettre à jour
    if (!open && options !== previousOptionsRef.current) {
      const validOptions = options.filter(option => 
        option && 
        option.id !== null && 
        option.id !== undefined && 
        option.nom && 
        typeof option.nom === 'string'
      );
      setStableOptions(validOptions);
      previousOptionsRef.current = validOptions;
    }
  };

  return (
    <Select 
      value={safeValue} 
      onValueChange={onValueChange}
      disabled={disabled}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {stableOptions.length === 0 ? (
          <SelectItem value="" disabled>
            {loadingMessage}
          </SelectItem>
        ) : (
          stableOptions.map((option) => (
            <SelectItem 
              key={`${keyPrefix}-${option.id}`} 
              value={option.id.toString()}
            >
              {option.nom}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};