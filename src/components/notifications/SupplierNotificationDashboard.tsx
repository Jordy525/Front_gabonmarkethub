import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Package, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react';
import { userNotificationService, UserNotification, UserNotificationCounts } from '@/services/userNotificationService';
import { SupplierNotificationBell } from './SupplierNotificationBell';

interface SupplierDashboardStats {
  totalNotifications: number;
  unreadNotifications: number;
  urgentNotifications: number;
  todayNotifications: number;
  byType: {
    messages: number;
    products: number;
    system: number;
  };
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  byCategory: {
    newMessages: number;
    contactRequests: number;
    productApproved: number;
    productRejected: number;
    modificationRequests: number;
    pendingModeration: number;
    systemMessages: number;
  };
}

export const SupplierNotificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<SupplierDashboardStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
    urgentNotifications: 0,
    todayNotifications: 0,
    byType: { messages: 0, products: 0, system: 0 },
    byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
    byCategory: {
      newMessages: 0,
      contactRequests: 0,
      productApproved: 0,
      productRejected: 0,
      modificationRequests: 0,
      pendingModeration: 0,
      systemMessages: 0
    }
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

      // Calculer les statistiques par catégorie
      const categoryStats = notifications.notifications.reduce((acc, notification) => {
        switch (notification.category) {
          case 'new_message':
            acc.newMessages++;
            break;
          case 'contact_request':
            acc.contactRequests++;
            break;
          case 'product_approved':
            acc.productApproved++;
            break;
          case 'product_rejected':
            acc.productRejected++;
            break;
          case 'modification_request':
            acc.modificationRequests++;
            break;
          case 'pending_moderation':
            acc.pendingModeration++;
            break;
          case 'system_message':
            acc.systemMessages++;
            break;
        }
        return acc;
      }, {
        newMessages: 0,
        contactRequests: 0,
        productApproved: 0,
        productRejected: 0,
        modificationRequests: 0,
        pendingModeration: 0,
        systemMessages: 0
      });

      setStats({
        totalNotifications: counts.total,
        unreadNotifications: counts.unread,
        urgentNotifications,
        todayNotifications,
        byType: {
          messages: counts.messages,
          products: counts.products,
          system: counts.system
        },
        byPriority: {
          urgent: counts.urgent,
          high: counts.high,
          medium: counts.total - counts.urgent - counts.high - (counts.total - counts.unread),
          low: counts.total - counts.urgent - counts.high - (counts.total - counts.unread)
        },
        byCategory: categoryStats
      });

      // Notifications récentes (5 dernières)
      setRecentNotifications(notifications.notifications.slice(0, 5));

    } catch (error) {
      console.error('Erreur chargement dashboard notifications fournisseur:', error);
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
            Gérez vos notifications et interactions avec les acheteurs
          </p>
        </div>
        <SupplierNotificationBell />
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
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type et catégorie */}
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
                  <Shield className="w-4 h-4 text-purple-600" />
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

      {/* Statistiques par catégorie fournisseur */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques fournisseur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats.byCategory.newMessages}</p>
              <p className="text-sm text-gray-600">Nouveaux messages</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.byCategory.contactRequests}</p>
              <p className="text-sm text-gray-600">Demandes de contact</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.byCategory.productApproved}</p>
              <p className="text-sm text-gray-600">Produits approuvés</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.byCategory.productRejected}</p>
              <p className="text-sm text-gray-600">Produits rejetés</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{stats.byCategory.modificationRequests}</p>
              <p className="text-sm text-gray-600">Demandes de modification</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{stats.byCategory.pendingModeration}</p>
              <p className="text-sm text-gray-600">En attente de modération</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{stats.byCategory.systemMessages}</p>
              <p className="text-sm text-gray-600">Messages système</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    notification.lu ? 'bg-gray-50' : 
                    notification.type === 'message' ? 'bg-blue-50 border-blue-200' :
                    notification.type === 'produit' ? 
                      notification.category === 'product_approved' ? 'bg-green-50 border-green-200' :
                      notification.category === 'product_rejected' ? 'bg-red-50 border-red-200' :
                      notification.category === 'modification_request' ? 'bg-orange-50 border-orange-200' :
                      notification.category === 'pending_moderation' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200' :
                    'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {notification.type === 'message' && <MessageCircle className="w-4 h-4 text-blue-600" />}
                        {notification.type === 'produit' && 
                          (notification.category === 'product_approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                           notification.category === 'product_rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                           notification.category === 'modification_request' ? <AlertTriangle className="w-4 h-4 text-orange-600" /> :
                           notification.category === 'pending_moderation' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                           <Package className="w-4 h-4 text-green-600" />)
                        }
                        {notification.type === 'systeme' && <Shield className="w-4 h-4 text-purple-600" />}
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
