import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supplierService } from '@/services/supplierService';

export const useSupplierLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierService.login,
    onSuccess: (response) => {
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user_type', 'supplier');
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        // Invalider les caches
        queryClient.invalidateQueries();
        
        toast.success('Connexion réussie !');
        navigate('/supplier/dashboard');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur de connexion');
    }
  });
};

export const useSupplierProfile = () => {
  return useQuery({
    queryKey: ['supplier-profile'],
    queryFn: supplierService.getProfile,
    enabled: !!localStorage.getItem('authToken') && localStorage.getItem('user_type') === 'supplier'
  });
};

export const useUpdateSupplierProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-profile'] });
      toast.success('Profil mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  });
};

export const useSupplierDocuments = () => {
  return useQuery({
    queryKey: ['supplier-documents'],
    queryFn: supplierService.getDocuments,
    enabled: !!localStorage.getItem('authToken') && localStorage.getItem('user_type') === 'supplier'
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) => 
      supplierService.uploadDocument(file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-documents'] });
      toast.success('Document uploadé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'upload');
    }
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierService.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-documents'] });
      toast.success('Document supprimé');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  });
};

export const useSupplierStats = () => {
  return useQuery({
    queryKey: ['supplier-stats'],
    queryFn: supplierService.getDashboardStats,
    enabled: !!localStorage.getItem('authToken') && localStorage.getItem('user_type') === 'supplier',
    refetchInterval: 30000 // Actualiser toutes les 30 secondes
  });
};

export const useSupplierProducts = () => {
  return useQuery({
    queryKey: ['supplier-products'],
    queryFn: supplierService.getProducts,
    enabled: !!localStorage.getItem('authToken') && localStorage.getItem('user_type') === 'supplier'
  });
};

// Hook supprimé - système de commandes retiré

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      supplierService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      toast.success('Statut de commande mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  });
};

export const useSupplierMessages = () => {
  return useQuery({
    queryKey: ['supplier-messages'],
    queryFn: supplierService.getMessages,
    enabled: !!localStorage.getItem('authToken') && localStorage.getItem('user_type') === 'supplier'
  });
};

export const useSupplierNotifications = () => {
  return useQuery({
    queryKey: ['supplier-notifications'],
    queryFn: supplierService.getNotifications,
    enabled: !!localStorage.getItem('authToken') && localStorage.getItem('user_type') === 'supplier',
    refetchInterval: 60000 // Actualiser toutes les minutes
  });
};

// Hook pour vérifier si l'utilisateur est un fournisseur connecté
export const useIsSupplier = () => {
  const userType = localStorage.getItem('user_type');
  const token = localStorage.getItem('authToken');
  
  return {
    isSupplier: userType === 'supplier' && !!token,
    isAuthenticated: !!token
  };
};