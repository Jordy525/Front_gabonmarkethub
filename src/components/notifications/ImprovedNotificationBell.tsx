import React, { useState, useEffect } from 'react';
import { Bell, Settings, Archive, Trash2, Check, CheckCheck, Filter, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/services/api';
import { notificationService } from '@/services/notificationService';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'message' | 'promotion' | 'systeme' | 'commande' | 'produit';
  lu: boolean;
  date_creation: string;
  url?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  types: {
    message: boolean;
    promotion: boolean;
    systeme: boolean;
    commande: boolean;
    produit: boolean;
  };
}

export const ImprovedNotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sound: true,
    types: {
      message: true,
      promotion: true,
      systeme: true,
      commande: true,
      produit: true
    }
  });

  const loadNotifications = async () => {
    try {
      const notificationsArray = await notificationService.getNotifications();
      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.filter((n: Notification) => !n.lu).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
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
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.lu) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  };

  const clearAllRead = async () => {
    try {
      const readNotifications = notifications.filter(n => n.lu);
      await Promise.all(readNotifications.map(n => notificationService.deleteNotification(n.id)));
      setNotifications(prev => prev.filter(n => !n.lu));
    } catch (error) {
      console.error('Erreur suppression notifications lues:', error);
    }
  };

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'read' && notification.lu) ||
      (filterStatus === 'unread' && !notification.lu);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Charger les notifications au montage et périodiquement
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  // Grouper les notifications par date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.date_creation).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'promotion':
        return '🎉';
      case 'systeme':
        return '⚙️';
      case 'commande':
        return '📦';
      case 'produit':
        return '🛍️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string, priority?: string) => {
    if (priority === 'high') return 'border-l-red-500 bg-red-50';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50';
    
    switch (type) {
      case 'message':
        return 'border-l-blue-500 bg-blue-50';
      case 'promotion':
        return 'border-l-green-500 bg-green-50';
      case 'systeme':
        return 'border-l-gray-500 bg-gray-50';
      case 'commande':
        return 'border-l-purple-500 bg-purple-50';
      case 'produit':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${Math.floor(diffInMinutes)} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    if (diffInMinutes < 10080) return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
    
    return date.toLocaleDateString('fr-FR');
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
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Tabs defaultValue="notifications" className="w-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Tout marquer comme lu
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="p-0">
            {/* Filtres */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="message">Messages</SelectItem>
                    <SelectItem value="promotion">Promotions</SelectItem>
                    <SelectItem value="systeme">Système</SelectItem>
                    <SelectItem value="commande">Commandes</SelectItem>
                    <SelectItem value="produit">Produits</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="unread">Non lus</SelectItem>
                    <SelectItem value="read">Lus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Liste des notifications */}
            <ScrollArea className="h-96">
              {filteredNotifications.length > 0 ? (
                <div className="p-4 space-y-4">
                  {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date}>
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        {new Date(date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      
                      {dateNotifications.map((notification) => (
                        <Card 
                          key={notification.id} 
                          className={cn(
                            "cursor-pointer hover:shadow-md transition-all border-l-4",
                            getNotificationColor(notification.type, notification.priority),
                            !notification.lu ? 'ring-2 ring-blue-200' : ''
                          )}
                          onClick={() => {
                            if (!notification.lu) markAsRead(notification.id);
                            if (notification.url) window.open(notification.url, '_blank');
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <h4 className={cn(
                                    "text-sm font-medium truncate",
                                    !notification.lu ? 'font-semibold' : ''
                                  )}>
                                    {notification.titre}
                                  </h4>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-400">
                                      {formatTime(notification.date_creation)}
                                    </span>
                                    {notification.priority === 'high' && (
                                      <Badge variant="destructive" className="text-xs">
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.lu && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Aucune notification ne correspond à vos critères'
                      : 'Aucune notification'
                    }
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Actions en bas */}
            {filteredNotifications.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={clearAllRead}>
                    <Archive className="w-3 h-3 mr-1" />
                    Nettoyer les lus
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Préférences de notification</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications par email</span>
                  <Button
                    variant={settings.email ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, email: !prev.email }))}
                  >
                    {settings.email ? "Activé" : "Désactivé"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications push</span>
                  <Button
                    variant={settings.push ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, push: !prev.push }))}
                  >
                    {settings.push ? "Activé" : "Désactivé"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Son de notification</span>
                  <Button
                    variant={settings.sound ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
                  >
                    {settings.sound ? "Activé" : "Désactivé"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h5 className="font-medium text-sm">Types de notifications</h5>
                {Object.entries(settings.types).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type}</span>
                    <Button
                      variant={enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        types: { ...prev.types, [type]: !enabled }
                      }))}
                    >
                      {enabled ? "Activé" : "Désactivé"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
