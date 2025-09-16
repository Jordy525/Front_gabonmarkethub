import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Fonction pour normaliser les dates reçues de l'API
export const normalizeDate = (dateValue: string | Date | null | undefined | any): Date | null => {
  try {
    // Si c'est déjà une Date valide
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue;
    }

    // Si c'est une chaîne vide ou null/undefined
    if (!dateValue || 
        dateValue === 'null' || 
        dateValue === 'undefined' ||
        dateValue === null ||
        dateValue === undefined ||
        dateValue === '') {
      return null;
    }

    // Si c'est un objet vide
    if (typeof dateValue === 'object' && 
        dateValue !== null && 
        !(dateValue instanceof Date) &&
        Object.keys(dateValue).length === 0) {
      return null;
    }

    // Essayer de créer une Date
    const date = new Date(dateValue);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      // Essayer de parser les formats MySQL courants
      if (typeof dateValue === 'string') {
        // Format MySQL: "2024-01-15 14:30:00"
        const mysqlDate = new Date(dateValue.replace(' ', 'T'));
        if (!isNaN(mysqlDate.getTime())) {
          return mysqlDate;
        }
        
        // Format date simple: "2024-01-15"
        const simpleDate = new Date(dateValue + 'T00:00:00');
        if (!isNaN(simpleDate.getTime())) {
          return simpleDate;
        }
      }
      
      console.warn('Impossible de parser la date:', dateValue, 'Type:', typeof dateValue);
      return null;
    }
    
    return date;
  } catch (error) {
    console.warn('Erreur lors de la normalisation de la date:', dateValue, 'Error:', error);
    return null;
  }
};

export const formatDateSafely = (
  dateValue: string | Date | null | undefined | any,
  options: {
    addSuffix?: boolean;
    fallback?: string;
    format?: 'relative' | 'absolute';
    dateFormat?: string;
  } = {}
): string => {
  const { 
    addSuffix = true, 
    fallback = 'Récemment',
    format: dateFormat = 'relative',
    dateFormat: customDateFormat = 'dd/MM/yyyy HH:mm'
  } = options;

  try {
    // Normaliser la date
    const normalizedDate = normalizeDate(dateValue);
    
    if (!normalizedDate) {
      return fallback;
    }

    // Formater selon le type demandé
    if (dateFormat === 'absolute') {
      return format(normalizedDate, customDateFormat, { locale: fr });
    }
    
    // Format relatif par défaut
    return formatDistanceToNow(normalizedDate, {
      addSuffix,
      locale: fr
    });
  } catch (error) {
    console.warn('Erreur lors du formatage de la date:', dateValue, 'Error:', error);
    return fallback;
  }
};

export const isValidDate = (dateValue: string | Date | null | undefined | any): boolean => {
  return normalizeDate(dateValue) !== null;
};

export const getMostRecentDate = (dates: (string | Date | null | undefined | any)[]): Date | null => {
  const validDates = dates
    .map(normalizeDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => b.getTime() - a.getTime());
  
  return validDates.length > 0 ? validDates[0] : null;
};

// Fonction utilitaire pour afficher l'heure d'un message
export const formatMessageTime = (dateValue: string | Date | null | undefined | any): string => {
  const normalizedDate = normalizeDate(dateValue);
  
  if (!normalizedDate) {
    return '';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate());
  
  // Si c'est aujourd'hui, afficher seulement l'heure
  if (messageDate.getTime() === today.getTime()) {
    return format(normalizedDate, 'HH:mm', { locale: fr });
  }
  
  // Si c'est hier, afficher "Hier HH:mm"
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Hier ${format(normalizedDate, 'HH:mm', { locale: fr })}`;
  }
  
  // Sinon, afficher la date complète
  return format(normalizedDate, 'dd/MM/yyyy HH:mm', { locale: fr });
};
