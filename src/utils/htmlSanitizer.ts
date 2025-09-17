/**
 * Utilitaire de sanitisation HTML simple pour éviter les erreurs React #418
 * et les problèmes de sécurité XSS
 */

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // Supprimer les scripts et les éléments dangereux
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<input\b[^>]*>/gi, '')
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Supprimer les attributs d'événements
    .replace(/javascript:/gi, '') // Supprimer les URLs javascript
    .replace(/data:/gi, '') // Supprimer les URLs data potentiellement dangereuses
    .replace(/vbscript:/gi, ''); // Supprimer les URLs vbscript

  // Nettoyer les attributs dangereux
  sanitized = sanitized.replace(/<(\w+)([^>]*?)>/gi, (match, tag, attributes) => {
    // Liste des attributs autorisés
    const allowedAttributes = [
      'class', 'id', 'style', 'title', 'alt', 'src', 'href', 'target', 'rel',
      'width', 'height', 'colspan', 'rowspan', 'align', 'valign',
      'data-*' // Permettre les attributs data-*
    ];

    // Nettoyer les attributs
    const cleanAttributes = attributes
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '') // Supprimer les événements
      .replace(/\s+javascript:/gi, '') // Supprimer javascript:
      .replace(/\s+data:/gi, '') // Supprimer data: dangereux
      .replace(/\s+vbscript:/gi, ''); // Supprimer vbscript:

    return `<${tag}${cleanAttributes}>`;
  });

  return sanitized;
};

/**
 * Vérifie si le contenu HTML est sûr à rendre
 */
export const isHtmlSafe = (html: string): boolean => {
  if (!html) return true;
  
  const dangerousPatterns = [
    /<script\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<form\b/i,
    /on\w+\s*=/i,
    /javascript:/i,
    /vbscript:/i
  ];

  return !dangerousPatterns.some(pattern => pattern.test(html));
};

/**
 * Composant de rendu HTML sécurisé
 */
export const createSafeHtmlRenderer = (html: string) => {
  const sanitized = sanitizeHtml(html);
  const isSafe = isHtmlSafe(sanitized);
  
  return {
    html: sanitized,
    isSafe,
    shouldRender: isSafe && sanitized.length > 0
  };
};
