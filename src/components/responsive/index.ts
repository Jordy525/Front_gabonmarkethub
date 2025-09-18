// Export centralisé des composants responsive
export { default as ResponsiveLayout } from '../layout/ResponsiveLayout';
export { default as ResponsiveHeader } from '../layout/ResponsiveHeader';
export { default as ResponsiveFooter } from '../layout/ResponsiveFooter';
export { default as ResponsiveProductCard } from '../ui/ResponsiveProductCard';
export { default as ResponsiveProductGrid } from '../ui/ResponsiveProductGrid';
export { default as ResponsiveForm, ResponsiveFormField } from '../ui/ResponsiveForm';
export { 
  default as ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell
} from '../ui/ResponsiveTable';
export { default as MobileNavigation } from '../navigation/MobileNavigation';

// Configuration responsive
export { 
  RESPONSIVE_CLASSES,
  useBreakpoint,
  getResponsiveClasses,
  SCREEN_SIZES,
  COMPONENT_CONFIGS
} from '../../config/responsive';
