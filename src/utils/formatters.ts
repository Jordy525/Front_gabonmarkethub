/**
 * Utilitaires de formatage pour éviter les erreurs de type
 */

/**
 * Formate un nombre de manière sécurisée avec toFixed
 * @param value - La valeur à formater (peut être string, number, null, undefined)
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns String formatée
 */
export const safeToFixed = (value: any, decimals: number = 2): string => {
  const num = Number(value);
  return isNaN(num) ? '0'.padEnd(decimals + 2, '.0') : num.toFixed(decimals);
};

/**
 * Formate un prix de manière sécurisée
 * @param price - Le prix à formater
 * @param currency - Devise (défaut: '€')
 * @returns Prix formaté avec devise
 */
export const formatPrice = (price: any, currency: string = '€'): string => {
  return `${safeToFixed(price, 2)}${currency}`;
};

/**
 * Formate une note de manière sécurisée
 * @param rating - La note à formater
 * @param maxRating - Note maximale (défaut: 5)
 * @returns Note formatée
 */
export const formatRating = (rating: any, maxRating: number = 5): string => {
  return `${safeToFixed(rating, 1)}/${maxRating}`;
};

/**
 * Formate un nombre entier de manière sécurisée
 * @param value - La valeur à formater
 * @returns Nombre entier ou 0
 */
export const safeInteger = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : Math.floor(num);
};

/**
 * Formate un nombre avec séparateurs de milliers
 * @param value - La valeur à formater
 * @returns Nombre formaté avec espaces
 */
export const formatNumber = (value: any): string => {
  const num = Number(value);
  return isNaN(num) ? '0' : num.toLocaleString('fr-FR');
};

/**
 * Formate un pourcentage de manière sécurisée
 * @param value - La valeur à formater (0-1 ou 0-100)
 * @param isDecimal - Si true, la valeur est entre 0-1, sinon 0-100
 * @returns Pourcentage formaté
 */
export const formatPercentage = (value: any, isDecimal: boolean = false): string => {
  const num = Number(value);
  if (isNaN(num)) return '0%';
  
  const percentage = isDecimal ? num * 100 : num;
  return `${percentage.toFixed(1)}%`;
};