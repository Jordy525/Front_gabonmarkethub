import { useEffect } from 'react';
import { useBreakpoint } from '@/config/responsive';

/**
 * Hook pour corriger automatiquement les problèmes de boutons sur mobile
 */
export const useMobileButtonFix = () => {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';

  useEffect(() => {
    if (!isMobile) return;

    // Fonction pour corriger les boutons de déconnexion
    const fixLogoutButtons = () => {
      // Sélectionner tous les boutons de déconnexion
      const logoutButtons = document.querySelectorAll(
        '[data-logout-button], .logout-button, button:has(svg[data-lucide="log-out"])'
      );

      logoutButtons.forEach((button) => {
        const element = button as HTMLElement;
        
        // Ajouter les classes nécessaires
        element.classList.add('touch-target', 'logout-button-red', 'important-button');
        
        // S'assurer que le bouton est visible
        element.style.minHeight = '44px';
        element.style.touchAction = 'manipulation';
        element.style.webkitTapHighlightColor = 'rgba(239, 68, 68, 0.1)';
        
        // Corriger les problèmes de visibilité
        if (element.style.display === 'none' || element.style.visibility === 'hidden') {
          element.classList.add('hidden-mobile-fix');
        }
      });
    };

    // Fonction pour corriger tous les boutons dans les dropdowns
    const fixDropdownButtons = () => {
      const dropdownItems = document.querySelectorAll('[role="menuitem"]');
      
      dropdownItems.forEach((item) => {
        const element = item as HTMLElement;
        element.classList.add('touch-target');
        element.style.minHeight = '44px';
        element.style.touchAction = 'manipulation';
      });
    };

    // Fonction pour corriger les boutons de navigation mobile
    const fixMobileNavButtons = () => {
      const navButtons = document.querySelectorAll('.mobile-nav button, nav button');
      
      navButtons.forEach((button) => {
        const element = button as HTMLElement;
        element.classList.add('mobile-nav-button', 'touch-target');
      });
    };

    // Appliquer les corrections
    const applyFixes = () => {
      fixLogoutButtons();
      fixDropdownButtons();
      fixMobileNavButtons();
    };

    // Appliquer immédiatement
    applyFixes();

    // Observer les changements dans le DOM
    const observer = new MutationObserver(() => {
      applyFixes();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Nettoyer l'observer
    return () => {
      observer.disconnect();
    };
  }, [isMobile]);

  return { isMobile };
};

/**
 * Hook pour forcer la visibilité des boutons importants sur mobile
 */
export const useMobileButtonVisibility = (buttonRef: React.RefObject<HTMLElement>) => {
  const { isMobile } = useMobileButtonFix();

  useEffect(() => {
    if (!isMobile || !buttonRef.current) return;

    const button = buttonRef.current;
    
    // S'assurer que le bouton est toujours visible
    const ensureVisibility = () => {
      if (button) {
        button.style.display = 'flex';
        button.style.visibility = 'visible';
        button.style.opacity = '1';
        button.classList.add('touch-target', 'important-button');
      }
    };

    ensureVisibility();

    // Vérifier périodiquement
    const interval = setInterval(ensureVisibility, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isMobile, buttonRef]);
};

export default useMobileButtonFix;