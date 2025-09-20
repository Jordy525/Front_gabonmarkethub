import React, { useEffect, useState } from 'react';
import { useBreakpoint } from '@/config/responsive';

/**
 * Composant de debug pour identifier les problèmes sur mobile
 * À utiliser uniquement en développement
 */
export const MobileDebugger: React.FC = () => {
  const breakpoint = useBreakpoint();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';

  useEffect(() => {
    if (!isMobile) return;

    const checkButtons = () => {
      const logoutButtons = document.querySelectorAll(
        'button:has(svg[data-lucide="log-out"]), [data-logout-button], .logout-button'
      );
      
      const dropdownItems = document.querySelectorAll('[role="menuitem"]');
      
      const hiddenButtons = Array.from(logoutButtons).filter(btn => {
        const element = btn as HTMLElement;
        const styles = window.getComputedStyle(element);
        return styles.display === 'none' || 
               styles.visibility === 'hidden' || 
               styles.opacity === '0' ||
               element.offsetHeight < 20;
      });

      setDebugInfo({
        breakpoint,
        totalLogoutButtons: logoutButtons.length,
        totalDropdownItems: dropdownItems.length,
        hiddenButtons: hiddenButtons.length,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp: new Date().toLocaleTimeString()
      });
    };

    checkButtons();
    const interval = setInterval(checkButtons, 2000);

    return () => clearInterval(interval);
  }, [isMobile, breakpoint]);

  // Ne pas afficher en production
  if (process.env.NODE_ENV === 'production') return null;
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs z-[9999] max-w-xs">
      <div className="font-bold mb-2">🔧 Mobile Debug</div>
      <div>Breakpoint: {debugInfo.breakpoint}</div>
      <div>Boutons déconnexion: {debugInfo.totalLogoutButtons}</div>
      <div>Items dropdown: {debugInfo.totalDropdownItems}</div>
      <div className="text-red-300">Boutons cachés: {debugInfo.hiddenButtons}</div>
      <div>Viewport: {debugInfo.viewport?.width}x{debugInfo.viewport?.height}</div>
      <div className="text-gray-300 text-xs mt-1">{debugInfo.timestamp}</div>
    </div>
  );
};

export default MobileDebugger;