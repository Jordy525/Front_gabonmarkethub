// Types partagés pour les composants de catégories
export interface Category {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  parent_id?: number;
  ordre: number;
  children?: Category[];
  productCount?: number;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export type CategoryVariant = 'default' | 'compact' | 'featured';
export type ViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'name-desc' | 'subcategories' | 'products';