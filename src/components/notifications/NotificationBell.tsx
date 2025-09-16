import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/services/api';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  lu: boolean;
  date_creation: string;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications');
      
      // CORRIGÉ: Vérifier que response.data existe et est un tableau
      const notificationsData = response?.data || response || [];
      const notificationsArray = Array.isArray(notificationsData) ? notificationsData : [];
      
      setNotifications(notificationsArray.slice(0, 5));
      setUnreadCount(notificationsArray.filter((n: Notification) => !n.lu).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      // En cas d'erreur, définir des valeurs par défaut
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lu: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-0 border-b rounded-none cursor-pointer hover:bg-gray-50 ${
                  !notification.lu ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (!notification.lu) markAsRead(notification.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      !notification.lu ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`text-sm ${!notification.lu ? 'font-semibold' : ''}`}>
                        {notification.titre}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.date_creation).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune notification</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};