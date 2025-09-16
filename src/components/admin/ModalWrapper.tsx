import React from 'react';

interface ModalWrapperProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Wrapper pour les modals qui évite les problèmes DOM insertBefore
 * en maintenant une structure DOM stable
 */
export const ModalWrapper: React.FC<ModalWrapperProps> = ({ 
  children, 
  isOpen, 
  onClose 
}) => {
  // Toujours rendre le wrapper, mais contrôler la visibilité via les props
  return (
    <div style={{ display: isOpen ? 'block' : 'none' }}>
      {children}
    </div>
  );
};

export default ModalWrapper;