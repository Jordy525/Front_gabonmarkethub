import { apiClient } from './api';
import type { 
  ApiResponse, 
  Product
} from '../types/api';

export interface CartItem {
  id: number;
  utilisateur_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  created_at: string;
  updated_at: string;
  produit?: Product;
}

export interface AddToCartRequest {
  produit_id: number;
  quantite: number;
  prix_unitaire?: number;
}

export interface UpdateCartItemRequest {
  quantite: number;
}

export class CartService {
  async getCart(): Promise<CartItem[]> {
    const response = await apiClient.get<CartItem[]>('/cart');
    return response || [];
  }

  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    const response = await apiClient.post<ApiResponse<CartItem>>('/cart/add', data);
    return response.data;
  }

  async updateCartItem(itemId: number, data: UpdateCartItemRequest): Promise<void> {
    await apiClient.put(`/cart/${itemId}`, data);
  }

  async removeFromCart(itemId: number): Promise<void> {
    await apiClient.delete(`/cart/${itemId}`);
  }

  async clearCart(): Promise<void> {
    await apiClient.delete('/cart');
  }

  async getCartCount(): Promise<number> {
    const response = await apiClient.get<{ data: { count: number } }>('/cart/count');
    return response.data?.count || 0;
  }

  async getCartTotal(): Promise<{ total_ht: number; total_ttc: number; tva: number }> {
    const response = await apiClient.get<{ data: { total_ht: number; total_ttc: number; tva: number } }>('/cart/total');
    return response.data || { total_ht: 0, total_ttc: 0, tva: 0 };
  }

  async getCartSummary(): Promise<{
    repartition_fournisseurs: any[];
    totaux: { total_ht: number; tva: number; total_ttc: number };
    nombre_fournisseurs: number;
  }> {
    const response = await apiClient.get<{ data: any }>('/cart/summary');
    return response.data;
  }
}

export const cartService = new CartService();