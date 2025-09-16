import React, { useState, useEffect } from 'react';
import { Bell, Filter, Search, Check, X, Trash2, MoreVertical, AlertTriangle, Users, Package, Settings, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminNotificationService, AdminNotification, AdminNotificationCounts } from '@/services/adminNotificationService';
import { toast } from 'sonner';

export const AdminNotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [counts, setCounts] = useState<AdminNotificationCounts>({
    total: 0,
    unread: 0,
    byType: { user_management: 0, product_management: 0, system: 0, order_management: 0 },
    byPriority: { low: 0, medium: 0, high: 0, urgent: 0 }
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
        adminNotificationService.getAllNotifications(),
        adminNotificationService.getNotificationCounts()
      ]);
      
      setNotifications(notificationsData);
      setCounts(countsData);
    } catch (error) {
      console.error('Erreur chargement notifications admin:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer comme lu
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await adminNotificationService.markAsRead(notificationId);
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
      await adminNotificationService.markAllAsRead();
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
      await adminNotificationService.deleteNotification(notificationId);
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
      await adminNotificationService.deleteAllRead();
      await loadNotifications();
      toast.success('Notifications lues supprimées');
    } catch (error) {
      console.error('Erreur suppression notifications lues:', error);
      toast.error('Erreur lors de la suppression des notifications');
    }
  };

  // Actions spécifiques
  const handleApproveUser = async (userId: number) => {
    try {
      await adminNotificationService.approveUser(userId);
      await loadNotifications();
      toast.success('Utilisateur approuvé');
    } catch (error) {
      console.error('Erreur approbation utilisateur:', error);
      toast.error('Erreur lors de l\'approbation de l\'utilisateur');
    }
  };

  const handleSuspendUser = async (userId: number, reason: string) => {
    try {
      await adminNotificationService.suspendUser(userId, reason);
      await loadNotifications();
      toast.success('Utilisateur suspendu');
    } catch (error) {
      console.error('Erreur suspension utilisateur:', error);
      toast.error('Erreur lors de la suspension de l\'utilisateur');
    }
  };

  const handleApproveProduct = async (productId: number) => {
    try {
      await adminNotificationService.approveProduct(productId);
      await loadNotifications();
      toast.success('Produit approuvé');
    } catch (error) {
      console.error('Erreur approbation produit:', error);
      toast.error('Erreur lors de l\'approbation du produit');
    }
  };

  const handleRejectProduct = async (productId: number, reason: string) => {
    try {
      await adminNotificationService.rejectProduct(productId, reason);
      await loadNotifications();
      toast.success('Produit rejeté');
    } catch (error) {
      console.error('Erreur rejet produit:', error);
      toast.error('Erreur lors du rejet du produit');
    }
  };

  // Effet pour charger les notifications
  useEffect(() => {
    loadNotifications();
    
    // Écouter les mises à jour de compteur
    const unsubscribe = adminNotificationService.addListener((newCounts) => {
      setCounts(newCounts);
    });

    // Démarrer le polling
    const intervalId = adminNotificationService.startPolling(30000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  // Filtrer les notifications
  const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  // Grouper les notifications par type
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = [];
    }
    acc[notification.type].push(notification);
    return acc;
  }, {} as Record<string, AdminNotification[]>);

  const getTypeIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'user_management': return <Users className="w-4 h-4" />;
      case 'product_management': return <Package className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'order_management': return <ShoppingCart className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: AdminNotification['type']) => {
    switch (type) {
      case 'user_management': return 'Gestion Utilisateurs';
      case 'product_management': return 'Gestion Produits';
      case 'system': return 'Système';
      case 'order_management': return 'Gestion Commandes';
      default: return 'Autres';
    }
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
              <CardTitle className="text-lg">Notifications Admin</CardTitle>
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
                  disabled={(Array.isArray(notifications) ? notifications : []).filter(n => n.isRead).length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Nettoyer
                </Button>
              </div>
            </div>

            {/* Filtres */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md"
                >
                  <option value="all">Tous les types</option>
                  <option value="user_management">Utilisateurs</option>
                  <option value="product_management">Produits</option>
                  <option value="system">Système</option>
                  <option value="order_management">Commandes</option>
                </select>
                
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">Élevée</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Faible</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">Toutes ({filteredNotifications.length})</TabsTrigger>
                    <TabsTrigger value="unread">Non lues ({counts.unread})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-0">
                    {Object.entries(groupedNotifications).map(([type, typeNotifications]) => (
                      <div key={type} className="border-b last:border-b-0">
                        <div className="px-4 py-2 bg-muted/50 flex items-center gap-2 text-sm font-medium">
                          {getTypeIcon(type as AdminNotification['type'])}
                          {getTypeLabel(type as AdminNotification['type'])} ({typeNotifications.length})
                        </div>
                        
                        {typeNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors ${
                              !notification.isRead ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <span className="text-lg">
                                  {adminNotificationService.getNotificationIcon(notification.type, notification.category)}
                                </span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium truncate">
                                    {notification.title}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${adminNotificationService.getPriorityColor(notification.priority)}`}
                                  >
                                    {notification.priority}
                                  </Badge>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(notification.createdAt).toLocaleString('fr-FR')}
                                  </span>
                                  
                                  <div className="flex items-center gap-1">
                                    {!notification.isRead && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Check className="w-3 h-3 mr-1" />
                                        Marquer lu
                                      </Button>
                                    )}
                                    
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreVertical className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {notification.type === 'user_management' && notification.userId && (
                                          <>
                                            <DropdownMenuItem onClick={() => handleApproveUser(notification.userId!)}>
                                              <Check className="w-3 h-3 mr-2" />
                                              Approuver utilisateur
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSuspendUser(notification.userId!, 'Raison non spécifiée')}>
                                              <X className="w-3 h-3 mr-2" />
                                              Suspendre utilisateur
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        {notification.type === 'product_management' && notification.productId && (
                                          <>
                                            <DropdownMenuItem onClick={() => handleApproveProduct(notification.productId!)}>
                                              <Check className="w-3 h-3 mr-2" />
                                              Approuver produit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRejectProduct(notification.productId!, 'Raison non spécifiée')}>
                                              <X className="w-3 h-3 mr-2" />
                                              Rejeter produit
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        <DropdownMenuItem onClick={() => handleDeleteNotification(notification.id)}>
                                          <Trash2 className="w-3 h-3 mr-2" />
                                          Supprimer
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="unread" className="mt-0">
                    {filteredNotifications.filter(n => !n.isRead).length === 0 ? (
                      <div className="p-4 text-center">
                        <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Toutes les notifications sont lues</p>
                      </div>
                    ) : (
                      filteredNotifications
                        .filter(n => !n.isRead)
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors bg-blue-50/50"
                          >
                            {/* Même structure que dans l'onglet "Toutes" */}
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <span className="text-lg">
                                  {adminNotificationService.getNotificationIcon(notification.type, notification.category)}
                                </span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium truncate">
                                    {notification.title}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${adminNotificationService.getPriorityColor(notification.priority)}`}
                                  >
                                    {notification.priority}
                                  </Badge>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(notification.createdAt).toLocaleString('fr-FR')}
                                  </span>
                                  
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Marquer lu
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteNotification(notification.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
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
