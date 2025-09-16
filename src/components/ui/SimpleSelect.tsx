import React, { useState, useEffect } from 'react';

interface SimpleSelectProps {
  value?: string | null | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ id: any; nom: string }>;
  disabled?: boolean;
  className?: string;
}

/**
 * SimpleSelect - Une alternative robuste au Select de Radix UI
 * Utilise un select HTML natif pour éviter les problèmes DOM
 */
export const SimpleSelect: React.FC<SimpleSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Sélectionner...",
  options = [],
  disabled = false,
  className = ""
}) => {
  // Valeur sûre directement calculée
  const safeValue = value?.toString() || "";

  // Filtrer et valider les options
  const validOptions = React.useMemo(() => {
    return options.filter(option => 
      option && 
      option.id !== null && 
      option.id !== undefined && 
      option.nom && 
      typeof option.nom === 'string'
    );
  }, [options]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (newValue !== safeValue) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="relative">
      <select
        value={safeValue}
        onChange={handleChange}
        disabled={disabled}
        className={`
          h-10 w-full appearance-none rounded-md border border-input 
          bg-background px-3 py-2 text-sm 
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
      >
        {!safeValue && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {validOptions.length === 0 ? (
          <option value="" disabled>
            Aucune option disponible
          </option>
        ) : (
          validOptions.map((option) => (
            <option key={`simple-${option.id}`} value={option.id.toString()}>
              {option.nom}
            </option>
          ))
        )}
      </select>
    </div>
  );
};