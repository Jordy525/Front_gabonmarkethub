import { apiClient } from './api';
import type { Category, ApiResponse } from '../types/api';

export class CategoryService {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<{ categories: Category[] }>('/categories');
    return response.categories || [];
  }

  async getCategoryTree(): Promise<Category[]> {
    const response = await apiClient.get<{ categories: Category[] }>('/categories/tree');
    return response.categories || [];
  }

  async getCategory(slug: string): Promise<Category> {
    const response = await apiClient.get<{ category: Category }>(`/categories/${slug}`);
    return response.category;
  }

  async getCategoryById(id: number): Promise<Category> {
    // Récupérer toutes les catégories et trouver celle avec l'ID
    const categories = await this.getCategories();
    const category = categories.find(c => c.id === id);
    if (!category) {
      throw new Error('Catégorie non trouvée');
    }
    return category;
  }

  async getMainCategories(): Promise<Category[]> {
    const categories = await this.getCategories();
    return categories.filter(cat => !cat.parent_id);
  }

  async getSubCategories(parentId: number): Promise<Category[]> {
    const categories = await this.getCategories();
    return categories.filter(cat => cat.parent_id === parentId);
  }
}

export const categoryService = new CategoryService();