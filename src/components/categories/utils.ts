import { Category } from './types';

// Utilitaires pour les catégories

/**
 * Organise une liste plate de catégories en hiérarchie
 */
export const buildCategoryHierarchy = (categories: Category[]): Category[] => {
  const categoryMap = new Map<number, Category>();
  const rootCategories: Category[] = [];
  
  // Créer la map de toutes les catégories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });
  
  // Organiser la hiérarchie
  categories.forEach((cat) => {
    const category = categoryMap.get(cat.id)!;
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children!.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });
  
  // Trier par ordre
  rootCategories.sort((a, b) => a.ordre - b.ordre);
  rootCategories.forEach(cat => {
    if (cat.children) {
      cat.children.sort((a, b) => a.ordre - b.ordre);
    }
  });
  
  return rootCategories;
};

/**
 * Trouve une catégorie par son slug dans une hiérarchie
 */
export const findCategoryBySlug = (categories: Category[], slug: string): Category | null => {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    if (category.children) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Construit le chemin de breadcrumb pour une catégorie
 */
export const buildCategoryBreadcrumb = (
  categories: Category[], 
  targetSlug: string
): { label: string; href: string }[] => {
  const findPath = (cats: Category[], slug: string, path: Category[] = []): Category[] | null => {
    for (const cat of cats) {
      const currentPath = [...path, cat];
      if (cat.slug === slug) {
        return currentPath;
      }
      if (cat.children) {
        const found = findPath(cat.children, slug, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const path = findPath(categories, targetSlug);
  if (!path) return [];

  return path.map(cat => ({
    label: cat.nom,
    href: `/categories/${cat.slug}`
  }));
};

/**
 * Filtre les catégories selon un terme de recherche
 */
export const filterCategories = (categories: Category[], searchTerm: string): Category[] => {
  if (!searchTerm) return categories;
  
  const term = searchTerm.toLowerCase();
  
  return categories.filter(category => {
    const matchesParent = category.nom.toLowerCase().includes(term) ||
                         (category.description && category.description.toLowerCase().includes(term));
    
    const matchesChild = category.children?.some(child => 
      child.nom.toLowerCase().includes(term) ||
      (child.description && child.description.toLowerCase().includes(term))
    );
    
    return matchesParent || matchesChild;
  });
};

/**
 * Trie les catégories selon différents critères
 */
export const sortCategories = (categories: Category[], sortBy: string): Category[] => {
  const sorted = [...categories];
  
  switch (sortBy) {
    case 'name-desc':
      return sorted.sort((a, b) => b.nom.localeCompare(a.nom));
    case 'subcategories':
      return sorted.sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0));
    case 'products':
      return sorted.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    default: // 'name'
      return sorted.sort((a, b) => a.nom.localeCompare(b.nom));
  }
};

/**
 * Compte le nombre total de sous-catégories
 */
export const getTotalSubcategories = (categories: Category[]): number => {
  return categories.reduce((total, cat) => total + (cat.children?.length || 0), 0);
};

/**
 * Obtient les catégories populaires (avec le plus de sous-catégories)
 */
export const getPopularCategories = (categories: Category[], limit = 6): Category[] => {
  return categories
    .filter(cat => cat.children && cat.children.length >= 2)
    .sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))
    .slice(0, limit);
};

/**
 * Génère une couleur de fond aléatoire pour une catégorie
 */
export const getCategoryColor = (index: number): string => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-purple-600',
    'bg-gradient-to-br from-pink-500 to-red-500',
    'bg-gradient-to-br from-green-500 to-teal-600',
    'bg-gradient-to-br from-yellow-500 to-orange-600',
    'bg-gradient-to-br from-indigo-500 to-blue-600',
    'bg-gradient-to-br from-purple-500 to-pink-600',
    'bg-gradient-to-br from-orange-500 to-red-600',
    'bg-gradient-to-br from-teal-500 to-green-600',
  ];
  
  return colors[index % colors.length];
};