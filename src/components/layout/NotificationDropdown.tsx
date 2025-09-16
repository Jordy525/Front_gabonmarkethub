import { useState } from "react";
import { Bell, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useNotifications, 
  useUnreadNotificationsCount, 
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification 
} from "@/hooks/api/useNotifications";
import { toast } from "sonner";
import { formatDateSafely } from '@/utils/dateUtils';
import { fr } from "date-fns/locale";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications } = useNotifications(1, 10);
  const { data: unreadCount } = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      toast.error("Erreur lors du marquage de la notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (error) {
      toast.error("Erreur lors du marquage des notifications");
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      toast.success("Notification supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'commande':
        return '📦';
      case 'message':
        return '💬';
      case 'promotion':
        return '🎉';
      case 'systeme':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateSafely(dateString, { 
      addSuffix: true, 
      fallback: 'Récemment'
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount?.data && unreadCount.data > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount.data > 99 ? '99+' : unreadCount.data}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications?.data && notifications.data.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Tout marquer
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-96">
          {notifications?.data && notifications.data.length > 0 ? (
            notifications.data.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                  !notification.lu ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.titre}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {!notification.lu && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {notification.url && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 p-0 h-auto text-green-600"
                    onClick={() => {
                      window.location.href = notification.url!;
                      setIsOpen(false);
                    }}
                  >
                    Voir plus →
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune notification</p>
            </div>
          )}
        </ScrollArea>
        
        {notifications?.data && notifications.data.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Button variant="link" size="sm" className="text-green-600">
                Voir toutes les notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;