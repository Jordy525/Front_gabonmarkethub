/**
 * Utilitaires pour les composants Select afin d'éviter les erreurs DOM
 */

/**
 * Nettoie une valeur pour qu'elle soit sûre à utiliser dans un Select
 * @param value - La valeur à nettoyer
 * @returns Une string sûre pour le Select
 */
export const sanitizeSelectValue = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return value.toString();
};

/**
 * Valide qu'un tableau d'options est sûr pour être utilisé dans un Select
 * @param options - Le tableau d'options à valider
 * @returns Le tableau d'options validé
 */
export const validateSelectOptions = <T extends { id: any }>(options: T[]): T[] => {
  if (!Array.isArray(options)) {
    console.warn('validateSelectOptions: options n\'est pas un tableau', options);
    return [];
  }
  
  return options.filter(option => {
    if (!option || typeof option !== 'object') {
      console.warn('validateSelectOptions: option invalide', option);
      return false;
    }
    
    if (option.id === null || option.id === undefined) {
      console.warn('validateSelectOptions: option sans id', option);
      return false;
    }
    
    return true;
  });
};

/**
 * Génère une clé unique pour un SelectItem
 * @param prefix - Le préfixe pour la clé
 * @param id - L'id de l'option
 * @returns Une clé unique
 */
export const generateSelectItemKey = (prefix: string, id: any): string => {
  return `${prefix}-${sanitizeSelectValue(id)}`;
};

/**
 * Crée un SelectItem de chargement par défaut
 * @param message - Le message à afficher
 * @returns Les props pour un SelectItem de chargement
 */
export const createLoadingSelectItem = (message: string = "Chargement...") => ({
  key: "loading",
  value: "",
  disabled: true,
  children: message
});