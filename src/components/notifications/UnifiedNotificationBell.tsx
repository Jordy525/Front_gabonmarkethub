import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Settings, Gift, Package, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { unifiedNotificationService, UnifiedNotification, NotificationCounts } from '@/services/unifiedNotificationService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const getNotificationIcon = (type: UnifiedNotification['type']) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="w-4 h-4" />;
    case 'system':
      return <Settings className="w-4 h-4" />;
    case 'promotion':
      return <Gift className="w-4 h-4" />;
    case 'order':
      return <Package className="w-4 h-4" />;
    case 'product':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getNotificationColor = (type: UnifiedNotification['type']) => {
  switch (type) {
    case 'message':
      return 'text-blue-600 bg-blue-50';
    case 'system':
      return 'text-gray-600 bg-gray-50';
    case 'promotion':
      return 'text-green-600 bg-green-50';
    case 'order':
      return 'text-orange-600 bg-orange-50';
    case 'product':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const UnifiedNotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    messages: 0,
    system: 0,
    promotion: 0,
    order: 0,
    product: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [notificationsData, countsData] = await Promise.all([
        unifiedNotificationService.getAllNotifications(),
        unifiedNotificationService.getNotificationCounts()
      ]);
      
      setNotifications(notificationsData);
      setCounts(countsData);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer comme lu
  const handleMarkAsRead = async (notificationId: string | number) => {
    try {
      await unifiedNotificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await unifiedNotificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  // Effet pour charger les notifications
  useEffect(() => {
    loadNotifications();
    
    // Écouter les mises à jour de compteur
    const unsubscribe = unifiedNotificationService.addListener((newCounts) => {
      setCounts(newCounts);
    });

    // Démarrer le polling
    const intervalId = unifiedNotificationService.startPolling(30000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // Grouper les notifications par type
  const groupedNotifications = notifications.reduce((acc, notif) => {
    if (!acc[notif.type]) {
      acc[notif.type] = [];
    }
    acc[notif.type].push(notif);
    return acc;
  }, {} as Record<UnifiedNotification['type'], UnifiedNotification[]>);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {counts.total > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {counts.total > 99 ? '99+' : counts.total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {counts.total > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
          
          {/* Compteurs par type */}
          {counts.total > 0 && (
            <div className="flex gap-2 mt-2">
              {counts.messages > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {counts.messages} message{counts.messages > 1 ? 's' : ''}
                </Badge>
              )}
              {counts.system > 0 && (
                <Badge variant="outline" className="text-xs">
                  {counts.system} système
                </Badge>
              )}
              {counts.promotion > 0 && (
                <Badge variant="outline" className="text-xs">
                  {counts.promotion} promotion{counts.promotion > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Chargement des notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Aucune notification
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedNotifications).map(([type, typeNotifications]) => (
                <div key={type}>
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {type === 'message' && 'Messages'}
                    {type === 'system' && 'Système'}
                    {type === 'promotion' && 'Promotions'}
                    {type === 'order' && 'Commandes'}
                    {type === 'product' && 'Produits'}
                  </div>
                  
                  {typeNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                                                     <div className="flex items-center justify-between mt-2">
                             <span className="text-xs text-gray-500">
                               {(() => {
                                 try {
                                   const date = new Date(notification.createdAt);
                                   if (isNaN(date.getTime())) {
                                     return 'Date invalide';
                                   }
                                   return formatDistanceToNow(date, { 
                                     addSuffix: true, 
                                     locale: fr 
                                   });
                                 } catch (error) {
                                   return 'Date invalide';
                                 }
                               })()}
                             </span>
                            
                            {notification.senderName && (
                              <span className="text-xs text-gray-500">
                                {notification.senderName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
