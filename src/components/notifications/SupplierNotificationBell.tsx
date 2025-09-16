import React, { useState, useEffect } from 'react';
import { Bell, Filter, Search, Check, X, Trash2, MoreVertical, MessageCircle, Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userNotificationService, UserNotification, UserNotificationCounts } from '@/services/userNotificationService';
import { toast } from 'sonner';

export const SupplierNotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [counts, setCounts] = useState<UserNotificationCounts>({
    total: 0,
    unread: 0,
    urgent: 0,
    high: 0,
    messages: 0,
    products: 0,
    system: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [notificationsData, countsData] = await Promise.all([
        userNotificationService.getNotifications(),
        userNotificationService.getNotificationCounts()
      ]);
      
      setNotifications(notificationsData.notifications || []);
      setCounts(countsData);
    } catch (error) {
      console.error('Erreur chargement notifications fournisseur:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer comme lu
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await userNotificationService.markAsRead(notificationId);
      await loadNotifications();
      toast.success('Notification marquée comme lue');
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      toast.error('Erreur lors du marquage de la notification');
    }
  };

  // Marquer toutes comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await userNotificationService.markAllAsRead();
      await loadNotifications();
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      toast.error('Erreur lors du marquage des notifications');
    }
  };

  // Supprimer une notification
  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await userNotificationService.deleteNotification(notificationId);
      await loadNotifications();
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      toast.error('Erreur lors de la suppression de la notification');
    }
  };

  // Supprimer toutes les notifications lues
  const handleDeleteAllRead = async () => {
    try {
      await userNotificationService.deleteAllRead();
      await loadNotifications();
      toast.success('Notifications lues supprimées');
    } catch (error) {
      console.error('Erreur suppression notifications lues:', error);
      toast.error('Erreur lors de la suppression des notifications');
    }
  };

  // Créer des notifications de test spécifiques aux fournisseurs
  const handleCreateTestNotifications = async () => {
    try {
      await userNotificationService.createTestNotifications('supplier', 5);
      await loadNotifications();
      toast.success('Notifications de test fournisseur créées');
    } catch (error) {
      console.error('Erreur création notifications test:', error);
      toast.error('Erreur lors de la création des notifications de test');
    }
  };

  // Charger les notifications au montage et configurer le polling
  useEffect(() => {
    loadNotifications();
    
    // Configurer le polling pour les mises à jour en temps réel
    userNotificationService.startPolling(30000); // 30 secondes
    
    // Listener pour les mises à jour de compteurs
    const handleCountsUpdate = (newCounts: UserNotificationCounts) => {
      setCounts(newCounts);
    };
    
    userNotificationService.addListener(handleCountsUpdate);
    
    return () => {
      userNotificationService.removeListener(handleCountsUpdate);
      userNotificationService.stopPolling();
    };
  }, []);

  // Filtrer les notifications
  const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  // Obtenir l'icône pour le type de notification fournisseur
  const getSupplierTypeIcon = (type: string, category: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'produit':
        if (category === 'product_approved') {
          return <CheckCircle className="w-4 h-4 text-green-600" />;
        } else if (category === 'product_rejected') {
          return <X className="w-4 h-4 text-red-600" />;
        } else if (category === 'modification_request') {
          return <AlertTriangle className="w-4 h-4 text-orange-600" />;
        } else if (category === 'pending_moderation') {
          return <Clock className="w-4 h-4 text-yellow-600" />;
        }
        return <Package className="w-4 h-4 text-green-600" />;
      case 'systeme':
        return <AlertTriangle className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Obtenir la couleur de fond selon le type
  const getNotificationBgColor = (type: string, category: string) => {
    if (type === 'message') {
      return 'bg-blue-50 border-blue-200';
    } else if (type === 'produit') {
      if (category === 'product_approved') {
        return 'bg-green-50 border-green-200';
      } else if (category === 'product_rejected') {
        return 'bg-red-50 border-red-200';
      } else if (category === 'modification_request') {
        return 'bg-orange-50 border-orange-200';
      } else if (category === 'pending_moderation') {
        return 'bg-yellow-50 border-yellow-200';
      }
      return 'bg-green-50 border-green-200';
    } else if (type === 'systeme') {
      return 'bg-purple-50 border-purple-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {counts.unread > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {counts.unread > 99 ? '99+' : counts.unread}
          </Badge>
        )}
      </Button>

      {/* Panneau de notifications */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-[600px] z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications Fournisseur</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={counts.unread === 0}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Tout marquer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAllRead}
                  disabled={(Array.isArray(notifications) ? notifications : []).filter(n => n.lu).length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Nettoyer
                </Button>
              </div>
            </div>

            {/* Filtres */}
            <div className="space-y-2">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Filter className="w-3 h-3 mr-1" />
                      {filterType === 'all' ? 'Tous les types' : userNotificationService.getTypeLabel(filterType)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterType('all')}>
                      Tous les types
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('message')}>
                      Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('produit')}>
                      Produits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('systeme')}>
                      Système
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Filter className="w-3 h-3 mr-1" />
                      {filterPriority === 'all' ? 'Toutes priorités' : filterPriority}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterPriority('all')}>
                      Toutes priorités
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterPriority('urgent')}>
                      Urgent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterPriority('high')}>
                      Élevée
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterPriority('medium')}>
                      Moyenne
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterPriority('low')}>
                      Faible
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">Aucune notification</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateTestNotifications}
                >
                  Créer des notifications de test
                </Button>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Toutes ({filteredNotifications.length})</TabsTrigger>
                    <TabsTrigger value="messages">Messages ({counts.messages})</TabsTrigger>
                    <TabsTrigger value="products">Produits ({counts.products})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-2 p-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.lu ? 'bg-gray-50' : getNotificationBgColor(notification.type, notification.category)
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getSupplierTypeIcon(notification.type, notification.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.titre}
                                </p>
                                {!notification.lu && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${userNotificationService.getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDate(notification.date_creation)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.lu && (
                                <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                  <Check className="w-3 h-3 mr-2" />
                                  Marquer comme lu
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="messages" className="space-y-2 p-2">
                    {filteredNotifications
                      .filter(n => n.type === 'message')
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border ${
                            notification.lu ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="flex-shrink-0 mt-1">
                                <MessageCircle className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.titre}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(notification.date_creation)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="products" className="space-y-2 p-2">
                    {filteredNotifications
                      .filter(n => n.type === 'produit')
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border ${
                            notification.lu ? 'bg-gray-50' : getNotificationBgColor(notification.type, notification.category)
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="flex-shrink-0 mt-1">
                                {getSupplierTypeIcon(notification.type, notification.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.titre}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(notification.date_creation)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
