import { apiClient, buildQueryString } from './api';
import type { 
  Product, 
  PaginatedResponse, 
  CreateProductRequest, 
  ProductFilters,
  ApiResponse 
} from '../types/api';

export class ProductService {
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<{ products: Product[] }>(`/products${queryString}`);
    
    // Adapter la réponse du backend au format attendu par le frontend
    return {
      data: response.products || [],
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: response.products?.length || 0,
        pages: Math.ceil((response.products?.length || 0) / (filters.limit || 20))
      }
    };
  }
  
  // Méthode spécifique pour les produits publics (acheteurs)
  async getPublicProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<{ products: Product[] }>(`/products/public${queryString}`);
    
    return {
      data: response.products || [],
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: response.products?.length || 0,
        pages: Math.ceil((response.products?.length || 0) / (filters.limit || 20))
      }
    };
  }

  async getProduct(id: number): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data || response;
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<{ message: string; productId: number }>('/products', productData);
    
    // Récupérer le produit créé
    if (response.productId) {
      return this.getProduct(response.productId);
    }
    
    throw new Error('Erreur lors de la création du produit');
  }

  async updateProduct(id: number, productData: Partial<CreateProductRequest>): Promise<Product> {
    await apiClient.put(`/products/${id}`, productData);
    return this.getProduct(id);
  }

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await apiClient.get<{ products: Product[] }>('/products/featured');
    return response.products || [];
  }

  async getProductsByCategory(categoryId: number, limit: number = 20): Promise<Product[]> {
    const response = await apiClient.get<{ products: Product[] }>(`/products/public?categorie=${categoryId}&limit=${limit}`);
    return response.products || [];
  }

  async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<PaginatedResponse<Product>> {
    const searchFilters = { ...filters, search: query };
    return this.getPublicProducts(searchFilters);
  }

  async getProductsBySupplier(supplierId: number, filters: Omit<ProductFilters, 'fournisseur_id'> = {}): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ ...filters, fournisseur_id: supplierId });
  }
  
  async uploadProductImages(productId: number, images: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    return apiClient.request<ApiResponse<string[]>>(`/products/${productId}/images`, {
      method: 'POST',
      body: formData
    });
  }
  
  async addToFavorites(productId: number): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/favorites', { produit_id: productId });
  }
  
  async removeFromFavorites(productId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/favorites/${productId}`);
  }
}

export const productService = new ProductService();