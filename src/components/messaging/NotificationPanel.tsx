import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  MessageCircle, 
  Check, 
  CheckCheck, 
  Clock,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye
} from 'lucide-react';
import { formatDateSafely } from '@/utils/dateUtils';
import { fr } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
  id: number;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
  conversation_subject: string;
  message_content: string;
  sender_name: string;
}

interface NotificationPanelProps {
  onError: (error: any, context: string) => void;
  onNotificationRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  onError,
  onNotificationRead
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/notifications?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw { response };
      }

      const data = await response.json();
      setNotifications(data.notifications || []);

    } catch (error) {
      onError(error, 'chargement des notifications');
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      setMarkingAsRead(prev => new Set(Array.from(prev).concat(notificationId)));

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Optimistic update
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Revert optimistic update
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: false, read_at: null }
              : notif
          )
        );
        throw { response };
      }

      onNotificationRead();

    } catch (error) {
      onError(error, 'marquage de notification');
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(notificationId);
        return newSet;
      });
    }
  }, [onError, onNotificationRead]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      if (unreadNotifications.length === 0) {
        toast({
          title: "Information",
          description: "Toutes les notifications sont déjà lues",
        });
        return;
      }

      // Optimistic update
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Marquer chaque notification individuellement
      const promises = unreadNotifications.map(notif => 
        fetch(`${import.meta.env.VITE_API_URL}/messages/notifications/${notif.id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );

      const results = await Promise.allSettled(promises);
      
      // Vérifier s'il y a eu des erreurs
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        // Revert optimistic update pour les échecs
        await loadNotifications();
        throw new Error(`${failures.length} notifications n'ont pas pu être marquées comme lues`);
      }

      onNotificationRead();

      toast({
        title: "Succès",
        description: `${unreadNotifications.length} notifications marquées comme lues`,
      });

    } catch (error) {
      onError(error, 'marquage de toutes les notifications');
    }
  }, [notifications, loadNotifications, onError, onNotificationRead, toast]);

  // Tronquer le texte
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Formater la date
  const formatNotificationDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
          return formatDateSafely(date, {
      addSuffix: true,
      fallback: 'Récemment'
    });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return '';
    }
  };

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Skeleton de chargement
  const NotificationSkeleton = () => (
    <div className="p-4 border-b border-border">
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {Array.from({ length: 5 }).map((_, index) => (
              <NotificationSkeleton key={index} />
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadNotifications}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            )}
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={loadNotifications}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadNotifications}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Aucune notification</p>
            <p className="text-sm">
              Vous n'avez pas encore reçu de notifications de messages
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const isMarkingAsRead = markingAsRead.has(notification.id);
                
                return (
                  <div
                    key={notification.id}
                    className={`
                      p-4 transition-colors hover:bg-muted/50
                      ${!notification.is_read ? 'bg-muted/30 border-l-4 border-l-primary' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icône */}
                      <div className={`
                        flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                        ${notification.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}
                      `}>
                        <MessageCircle className="h-4 w-4" />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        {/* En-tête */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`
                              text-sm font-medium truncate
                              ${!notification.is_read ? 'font-semibold' : ''}
                            `}>
                              {notification.conversation_subject}
                            </h4>
                            {!notification.is_read && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatNotificationDate(notification.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Message */}
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            <span className="font-medium">{notification.sender_name}</span> a écrit :
                          </p>
                          <p className={`
                            text-sm line-clamp-2
                            ${!notification.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'}
                          `}>
                            {truncateText(notification.message_content)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              disabled={isMarkingAsRead}
                              className="h-6 px-2 text-xs"
                            >
                              {isMarkingAsRead ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Marquage...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Marquer comme lu
                                </>
                              )}
                            </Button>
                          )}
                          
                          {notification.is_read && notification.read_at && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              <span>
                                Lu {formatNotificationDate(notification.read_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};