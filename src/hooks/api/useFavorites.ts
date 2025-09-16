import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../../services/favoriteService';

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: favoriteService.getFavorites,
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: favoriteService.addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useRemoveFavoriteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: favoriteService.removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useIsFavorite = (productId: number) => {
  return useQuery({
    queryKey: ['is-favorite', productId],
    queryFn: () => favoriteService.isFavorite(productId),
    enabled: !!productId,
  });
};