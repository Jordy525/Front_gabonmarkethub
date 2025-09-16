import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Package, 
  ShoppingCart, 
  Gift, 
  Settings, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';
import { userNotificationService, UserNotification, UserNotificationCounts } from '@/services/userNotificationService';
import { UserNotificationBell } from './UserNotificationBell';

interface DashboardStats {
  totalNotifications: number;
  unreadNotifications: number;
  urgentNotifications: number;
  todayNotifications: number;
  byType: {
    messages: number;
    products: number;
    orders: number;
    promotions: number;
    system: number;
  };
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const UserNotificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
    urgentNotifications: 0,
    todayNotifications: 0,
    byType: { messages: 0, products: 0, orders: 0, promotions: 0, system: 0 },
    byPriority: { urgent: 0, high: 0, medium: 0, low: 0 }
  });
  const [recentNotifications, setRecentNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les statistiques et notifications récentes
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [counts, notifications] = await Promise.all([
        userNotificationService.getNotificationCounts(),
        userNotificationService.getNotifications()
      ]);

      // Calculer les statistiques
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayNotifications = notifications.notifications.filter(n => 
        new Date(n.date_creation) >= today
      ).length;

      const urgentNotifications = counts.urgent + counts.high;

      setStats({
        totalNotifications: counts.total,
        unreadNotifications: counts.unread,
        urgentNotifications,
        todayNotifications,
        byType: {
          messages: counts.messages,
          products: counts.products,
          orders: 0, // À implémenter quand les commandes seront ajoutées
          promotions: 0, // À implémenter quand les promotions seront ajoutées
          system: counts.system
        },
        byPriority: {
          urgent: counts.urgent,
          high: counts.high,
          medium: counts.total - counts.urgent - counts.high - (counts.total - counts.unread),
          low: counts.total - counts.urgent - counts.high - (counts.total - counts.unread)
        }
      });

      // Notifications récentes (5 dernières)
      setRecentNotifications(notifications.notifications.slice(0, 5));

    } catch (error) {
      console.error('Erreur chargement dashboard notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Configurer le polling
    userNotificationService.startPolling(30000);
    
    const handleCountsUpdate = (newCounts: UserNotificationCounts) => {
      setStats(prev => ({
        ...prev,
        totalNotifications: newCounts.total,
        unreadNotifications: newCounts.unread,
        urgentNotifications: newCounts.urgent + newCounts.high,
        byType: {
          ...prev.byType,
          messages: newCounts.messages,
          products: newCounts.products,
          system: newCounts.system
        }
      }));
    };
    
    userNotificationService.addListener(handleCountsUpdate);
    
    return () => {
      userNotificationService.removeListener(handleCountsUpdate);
      userNotificationService.stopPolling();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord des notifications</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de vos notifications et alertes
          </p>
        </div>
        <UserNotificationBell />
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.totalNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Non lues</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unreadNotifications}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgentNotifications}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayNotifications}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type et priorité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par type */}
        <Card>
          <CardHeader>
            <CardTitle>Par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Messages</span>
                </div>
                <Badge variant="outline">{stats.byType.messages}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Produits</span>
                </div>
                <Badge variant="outline">{stats.byType.products}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Commandes</span>
                </div>
                <Badge variant="outline">{stats.byType.orders}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Promotions</span>
                </div>
                <Badge variant="outline">{stats.byType.promotions}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Système</span>
                </div>
                <Badge variant="outline">{stats.byType.system}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Par priorité */}
        <Card>
          <CardHeader>
            <CardTitle>Par priorité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Urgent</span>
                </div>
                <Badge variant="destructive">{stats.byPriority.urgent}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Élevée</span>
                </div>
                <Badge variant="outline" className="text-orange-600 bg-orange-50">
                  {stats.byPriority.high}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Moyenne</span>
                </div>
                <Badge variant="outline" className="text-blue-600 bg-blue-50">
                  {stats.byPriority.medium}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Faible</span>
                </div>
                <Badge variant="outline" className="text-gray-600 bg-gray-50">
                  {stats.byPriority.low}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune notification récente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.lu ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {notification.type === 'message' && <MessageCircle className="w-4 h-4 text-blue-600" />}
                        {notification.type === 'produit' && <Package className="w-4 h-4 text-green-600" />}
                        {notification.type === 'commande' && <ShoppingCart className="w-4 h-4 text-orange-600" />}
                        {notification.type === 'systeme' && <Settings className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.titre}
                          </p>
                          {!notification.lu && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
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
                            {new Date(notification.date_creation).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
