// Configuration responsive centralisée pour GabMarketHub
// Ce fichier définit tous les breakpoints et utilitaires responsive

import { useState, useEffect } from 'react';

// Breakpoints Tailwind CSS
export const BREAKPOINTS = {
  xs: '0px',      // Mobile portrait
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet portrait
  lg: '1024px',   // Tablet landscape / Desktop small
  xl: '1280px',   // Desktop medium
  '2xl': '1536px' // Desktop large
} as const;

// Classes responsive communes
export const RESPONSIVE_CLASSES = {
  // Containers
  container: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
  containerFluid: 'w-full px-4 sm:px-6 lg:px-8',
  
  // Grids
  grid1: 'grid grid-cols-1',
  grid2: 'grid grid-cols-1 sm:grid-cols-2',
  grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  grid4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gridAuto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  
  // Flexbox
  flexCol: 'flex flex-col',
  flexRow: 'flex flex-row',
  flexColMobile: 'flex flex-col sm:flex-row',
  flexRowMobile: 'flex flex-row sm:flex-col',
  
  // Spacing
  spacing: {
    section: 'py-8 sm:py-12 lg:py-16',
    sectionSmall: 'py-4 sm:py-6 lg:py-8',
    sectionLarge: 'py-12 sm:py-16 lg:py-20',
    gap: 'gap-4 sm:gap-6 lg:gap-8',
    gapSmall: 'gap-2 sm:gap-4',
    gapLarge: 'gap-6 sm:gap-8 lg:gap-12'
  },
  
  // Text
  text: {
    h1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
    h2: 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl',
    h3: 'text-lg sm:text-xl lg:text-2xl xl:text-3xl',
    h4: 'text-base sm:text-lg lg:text-xl xl:text-2xl',
    body: 'text-sm sm:text-base lg:text-lg',
    small: 'text-xs sm:text-sm',
    large: 'text-base sm:text-lg lg:text-xl'
  },
  
  // Buttons
  button: {
    primary: 'w-full sm:w-auto',
    secondary: 'w-full sm:w-auto',
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  },
  
  // Cards
  card: 'w-full max-w-sm sm:max-w-md lg:max-w-lg',
  cardGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  
  // Forms
  form: {
    container: 'w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto',
    field: 'w-full',
    fieldHalf: 'w-full sm:w-1/2',
    fieldThird: 'w-full sm:w-1/3',
    fieldTwoThird: 'w-full sm:w-2/3'
  },
  
  // Navigation
  nav: {
    desktop: 'hidden lg:flex',
    mobile: 'lg:hidden',
    menu: 'flex flex-col lg:flex-row',
    item: 'w-full lg:w-auto'
  },
  
  // Sidebar
  sidebar: {
    mobile: 'fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
    overlay: 'fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden'
  },
  
  // Tables
  table: {
    container: 'overflow-x-auto',
    table: 'min-w-full divide-y divide-gray-200',
    cell: 'px-3 py-2 sm:px-6 sm:py-4 text-sm'
  },
  
  // Modals
  modal: {
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl',
    mobile: 'w-full max-w-sm mx-auto'
  }
} as const;

// Utilitaires responsive
export const getResponsiveClasses = (base: string, mobile?: string, tablet?: string, desktop?: string) => {
  const classes = [base];
  if (mobile) classes.push(`sm:${mobile}`);
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
};

// Hook pour détecter la taille d'écran
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<string>('xs');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 640) setBreakpoint('sm');
      else setBreakpoint('xs');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
};

// Constantes pour les tailles d'écran
export const SCREEN_SIZES = {
  isMobile: (width: number) => width < 768,
  isTablet: (width: number) => width >= 768 && width < 1024,
  isDesktop: (width: number) => width >= 1024,
  isLargeDesktop: (width: number) => width >= 1280
} as const;

// Configuration des composants responsive
export const COMPONENT_CONFIGS = {
  // Header
  header: {
    height: 'h-16 sm:h-20',
    logo: 'text-lg sm:text-xl lg:text-2xl',
    nav: 'hidden lg:flex items-center space-x-6',
    mobileNav: 'lg:hidden flex flex-col space-y-2'
  },
  
  // Footer
  footer: {
    container: 'py-8 sm:py-12 lg:py-16',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8',
    text: 'text-sm sm:text-base'
  },
  
  // Product cards
  productCard: {
    container: 'w-full max-w-sm sm:max-w-md lg:max-w-lg',
    image: 'w-full h-48 sm:h-56 lg:h-64',
    title: 'text-sm sm:text-base lg:text-lg',
    price: 'text-lg sm:text-xl lg:text-2xl',
    description: 'text-xs sm:text-sm lg:text-base'
  },
  
  // Forms
  form: {
    container: 'w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto p-4 sm:p-6 lg:p-8',
    field: 'w-full mb-4 sm:mb-6',
    label: 'text-sm sm:text-base font-medium',
    input: 'w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base',
    button: 'w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base'
  },
  
  // Tables
  table: {
    container: 'overflow-x-auto -mx-4 sm:mx-0',
    table: 'min-w-full divide-y divide-gray-200',
    header: 'px-3 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm font-medium',
    cell: 'px-3 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm'
  }
} as const;

export default RESPONSIVE_CLASSES;
