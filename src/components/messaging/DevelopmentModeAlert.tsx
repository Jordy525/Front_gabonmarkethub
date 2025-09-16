import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isDevelopmentMode } from '@/config/constants';

export const DevelopmentModeAlert: React.FC = () => {
  if (!isDevelopmentMode) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Mode développement activé</strong> - Les données affichées sont simulées. 
        Le système de messagerie temps réel sera pleinement fonctionnel une fois le backend configuré.
      </AlertDescription>
    </Alert>
  );
};