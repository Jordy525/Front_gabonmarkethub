import React, { useRef, useEffect } from 'react';
// import { SimpleChat, SimpleChatProps } from './SimpleChat'; // TODO: Migrer vers SimpleChat

// Hook pour les annonces d'accessibilité
const useAnnouncements = () => {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Nettoyer après un délai
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const AnnouncementRegion = () => (
    <div
      ref={announceRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );

  return { announce, AnnouncementRegion };
};

export interface AccessibleChatContainerProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const AccessibleChatContainer: React.FC<AccessibleChatContainerProps> = ({
  ariaLabel = "Interface de messagerie",
  ariaDescribedBy,
  ...props
}) => {
  const { announce, AnnouncementRegion } = useAnnouncements();

  // Annoncer les nouveaux messages
  useEffect(() => {
    // Cette logique serait connectée aux événements de nouveaux messages
    // announce("Nouveau message reçu", "polite");
  }, [announce]);

  return (
    <div
      role="application"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className="focus-within:outline-none"
    >
      <AnnouncementRegion />
      {/* TODO: Remplacer par SimpleChat */}
      <div className="p-4 text-center text-gray-500">
        AccessibleChatContainer en cours de migration
      </div>
    </div>
  );
};

// Composant pour les raccourcis clavier
export const KeyboardShortcuts: React.FC = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K : Ouvrir la recherche
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Logique pour ouvrir la recherche
      }

      // Échap : Fermer les modales/popups
      if (event.key === 'Escape') {
        // Logique pour fermer les éléments ouverts
      }

      // Flèches haut/bas : Navigation dans la liste des conversations
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const activeElement = document.activeElement;
        if (activeElement?.closest('[role="listbox"]')) {
          event.preventDefault();
          // Logique de navigation
        }
      }

      // Entrée : Sélectionner une conversation
      if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement?.getAttribute('role') === 'option') {
          event.preventDefault();
          (activeElement as HTMLElement).click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
};

// Guide des raccourcis clavier
export const KeyboardShortcutsHelp: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="shortcuts-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 id="shortcuts-title" className="text-lg font-semibold mb-4">
          Raccourcis clavier
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Rechercher</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl + K</kbd>
          </div>
          <div className="flex justify-between">
            <span>Fermer</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Échap</kbd>
          </div>
          <div className="flex justify-between">
            <span>Navigation</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">↑ ↓</kbd>
          </div>
          <div className="flex justify-between">
            <span>Sélectionner</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Entrée</kbd>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};