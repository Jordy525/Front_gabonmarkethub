import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface SafeSelectProps {
  value?: string | null | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * SafeSelect - Un wrapper autour du composant Select qui gère les valeurs null/undefined
 * pour éviter l'erreur "NotFoundError: Failed to execute 'removeChild' on 'Node'"
 */
export const SafeSelect: React.FC<SafeSelectProps> = ({
  value,
  onValueChange,
  placeholder,
  children,
  disabled = false
}) => {
  // S'assurer que la valeur est toujours une string
  const safeValue = value?.toString() || "";

  return (
    <Select 
      value={safeValue} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  );
};

interface SafeSelectItemProps {
  value: string | number;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * SafeSelectItem - Un wrapper autour du SelectItem qui s'assure que la valeur est une string
 */
export const SafeSelectItem: React.FC<SafeSelectItemProps> = ({
  value,
  children,
  disabled = false
}) => {
  // S'assurer que la valeur est toujours une string non vide
  const safeValue = value?.toString() || "";
  
  if (!safeValue) {
    return null; // Ne pas rendre l'item si la valeur est vide
  }

  return (
    <SelectItem value={safeValue} disabled={disabled}>
      {children}
    </SelectItem>
  );
};