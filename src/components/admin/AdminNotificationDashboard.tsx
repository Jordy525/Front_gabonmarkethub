import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Package, 
  Settings, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { adminNotificationService, AdminNotification, AdminNotificationCounts } from '@/services/adminNotificationService';
import { AdminNotificationBell } from './AdminNotificationBell';

interface DashboardStats {
  totalNotifications: number;
  unreadNotifications: number;
  urgentNotifications: number;
  todayNotifications: number;
  byType: {
    user_management: number;
    product_management: number;
    system: number;
    order_management: number;
  };
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const AdminNotificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
    urgentNotifications: 0,
    todayNotifications: 0,
    byType: { user_management: 0, product_management: 0, system: 0, order_management: 0 },
    byPriority: { urgent: 0, high: 0, medium: 0, low: 0 }
  });
  const [recentNotifications, setRecentNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les statistiques et notifications récentes
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [counts, notifications] = await Promise.all([
        adminNotificationService.getNotificationCounts(),
        adminNotificationService.getAllNotifications()
      ]);

      // Calculer les statistiques
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayNotifications = notifications.filter(n => 
        new Date(n.createdAt) >= today
      ).length;

      const urgentNotifications = counts.byPriority.urgent + counts.byPriority.high;

      setStats({
        totalNotifications: counts.total,
        unreadNotifications: counts.unread,
        urgentNotifications,
        todayNotifications,
        byType: counts.byType,
        byPriority: counts.byPriority
      });

      // Notifications récentes (5 dernières)
      setRecentNotifications(notifications.slice(0, 5));

    } catch (error) {
      console.error('Erreur chargement dashboard notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Écouter les mises à jour
    const unsubscribe = adminNotificationService.addListener(() => {
      loadDashboardData();
    });

    // Polling
    const intervalId = adminNotificationService.startPolling(30000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_management': return <Users className="w-5 h-5" />;
      case 'product_management': return <Package className="w-5 h-5" />;
      case 'system': return <Settings className="w-5 h-5" />;
      case 'order_management': return <ShoppingCart className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user_management': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'product_management': return 'text-green-600 bg-green-50 border-green-200';
      case 'system': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'order_management': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tableau de bord des notifications</h2>
          <AdminNotificationBell />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
            Vue d'ensemble des notifications et alertes du système
          </p>
        </div>
        <AdminNotificationBell />
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
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
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

      {/* Détails par type et priorité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Notifications par type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(type)}
                  <span className="capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </div>
                <Badge variant="outline" className={getTypeColor(type)}>
                  {count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Par priorité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Notifications par priorité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(priority)}
                  <span className="capitalize">{priority}</span>
                </div>
                <Badge variant="outline" className={
                  priority === 'urgent' ? 'text-red-600 bg-red-50 border-red-200' :
                  priority === 'high' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                  priority === 'medium' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                  'text-green-600 bg-green-50 border-green-200'
                }>
                  {count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Notifications récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Notifications récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune notification récente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    !notification.isRead ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            notification.priority === 'urgent' ? 'text-red-600 bg-red-50 border-red-200' :
                            notification.priority === 'high' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                            notification.priority === 'medium' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                            'text-green-600 bg-green-50 border-green-200'
                          }`}
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
                          {notification.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
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
