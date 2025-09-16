import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  data: any;
}

interface UseModalStateReturn<T> {
  isOpen: boolean;
  data: T | null;
  openModal: (data?: T) => void;
  closeModal: () => void;
  updateData: (data: T) => void;
}

/**
 * Hook personnalisé pour gérer l'état des modals de manière stable
 * Évite les problèmes de rendu DOM en maintenant un état cohérent
 */
export function useModalState<T = any>(initialData: T | null = null): UseModalStateReturn<T> {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    data: initialData
  });

  const openModal = useCallback((data?: T) => {
    setState(prev => ({
      isOpen: true,
      data: data !== undefined ? data : prev.data
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false
      // Garder les données pour éviter les re-renders
    }));
  }, []);

  const updateData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data
    }));
  }, []);

  return {
    isOpen: state.isOpen,
    data: state.data,
    openModal,
    closeModal,
    updateData
  };
}

export default useModalState;