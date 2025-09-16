import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userNotificationService, UserNotification, UserNotificationCounts, UserNotificationFilters } from '@/services/userNotificationService';
import { toast } from 'sonner';

// Hook pour récupérer les notifications
export const useUserNotifications = (filters: UserNotificationFilters = {}) => {
  return useQuery({
    queryKey: ['userNotifications', filters],
    queryFn: () => userNotificationService.getNotifications(filters),
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: true,
  });
};

// Hook pour récupérer les compteurs de notifications
export const useUserNotificationCounts = () => {
  return useQuery({
    queryKey: ['userNotificationCounts'],
    queryFn: () => userNotificationService.getNotificationCounts(),
    staleTime: 10000, // 10 secondes
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch toutes les 30 secondes
  });
};

// Hook pour marquer une notification comme lue
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => userNotificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalider et refetch les queries liées
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['userNotificationCounts'] });
      toast.success('Notification marquée comme lue');
    },
    onError: (error) => {
      console.error('Erreur marquage notification:', error);
      toast.error('Erreur lors du marquage de la notification');
    },
  });
};

// Hook pour marquer toutes les notifications comme lues
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['userNotificationCounts'] });
      toast.success('Toutes les notifications marquées comme lues');
    },
    onError: (error) => {
      console.error('Erreur marquage toutes notifications:', error);
      toast.error('Erreur lors du marquage des notifications');
    },
  });
};

// Hook pour supprimer une notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => userNotificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['userNotificationCounts'] });
      toast.success('Notification supprimée');
    },
    onError: (error) => {
      console.error('Erreur suppression notification:', error);
      toast.error('Erreur lors de la suppression de la notification');
    },
  });
};

// Hook pour supprimer toutes les notifications lues
export const useDeleteAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userNotificationService.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['userNotificationCounts'] });
      toast.success('Notifications lues supprimées');
    },
    onError: (error) => {
      console.error('Erreur suppression notifications lues:', error);
      toast.error('Erreur lors de la suppression des notifications');
    },
  });
};

// Hook pour créer des notifications de test
export const useCreateTestNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, count }: { type: string; count: number }) => 
      userNotificationService.createTestNotifications(type, count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['userNotificationCounts'] });
      toast.success('Notifications de test créées');
    },
    onError: (error) => {
      console.error('Erreur création notifications test:', error);
      toast.error('Erreur lors de la création des notifications de test');
    },
  });
};
