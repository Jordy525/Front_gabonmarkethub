import { useState, useEffect, useRef } from 'react';

interface SelectOption {
  id: any;
  nom: string;
  [key: string]: any;
}

/**
 * Hook pour gérer les données des Select de manière stable
 * Évite les changements de données pendant que le Select est ouvert
 */
export const useStableSelectData = <T extends SelectOption>(
  data: T[],
  isLoading: boolean = false
) => {
  const [stableData, setStableData] = useState<T[]>([]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const previousDataRef = useRef<T[]>([]);

  // Fonction pour valider et nettoyer les données
  const validateData = (rawData: T[]): T[] => {
    if (!Array.isArray(rawData)) {
      console.warn('useStableSelectData: données non valides (pas un tableau)', rawData);
      return [];
    }

    return rawData.filter(item => {
      if (!item || typeof item !== 'object') {
        console.warn('useStableSelectData: item invalide', item);
        return false;
      }

      if (item.id === null || item.id === undefined) {
        console.warn('useStableSelectData: item sans id', item);
        return false;
      }

      if (!item.nom || typeof item.nom !== 'string') {
        console.warn('useStableSelectData: item sans nom valide', item);
        return false;
      }

      return true;
    });
  };

  // Mettre à jour les données stables seulement si le Select est fermé
  useEffect(() => {
    if (!isSelectOpen && !isLoading) {
      const validatedData = validateData(data);
      
      // Vérifier si les données ont réellement changé
      const hasChanged = JSON.stringify(validatedData) !== JSON.stringify(previousDataRef.current);
      
      if (hasChanged) {
        setStableData(validatedData);
        previousDataRef.current = validatedData;
      }
    }
  }, [data, isSelectOpen, isLoading]);

  // Initialiser les données stables au premier rendu
  useEffect(() => {
    if (stableData.length === 0 && data.length > 0 && !isLoading) {
      const validatedData = validateData(data);
      setStableData(validatedData);
      previousDataRef.current = validatedData;
    }
  }, [data, isLoading, stableData.length]);

  return {
    stableData,
    isSelectOpen,
    setIsSelectOpen,
    isEmpty: stableData.length === 0,
    isLoading
  };
};

/**
 * Hook spécialisé pour les secteurs d'activité
 */
export const useStableSecteurs = (secteurs: SelectOption[], isLoading: boolean = false) => {
  return useStableSelectData(secteurs, isLoading);
};

/**
 * Hook spécialisé pour les types d'entreprise
 */
export const useStableTypesEntreprise = (types: SelectOption[], isLoading: boolean = false) => {
  return useStableSelectData(types, isLoading);
};

/**
 * Hook spécialisé pour les catégories
 */
export const useStableCategories = (categories: SelectOption[], isLoading: boolean = false) => {
  return useStableSelectData(categories, isLoading);
};