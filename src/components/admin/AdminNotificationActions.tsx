import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  Settings, 
  ShoppingCart, 
  Check, 
  X, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';
import { AdminNotification } from '@/services/adminNotificationService';
import { toast } from 'sonner';

interface AdminNotificationActionsProps {
  notification: AdminNotification;
  onActionComplete: () => void;
}

export const AdminNotificationActions: React.FC<AdminNotificationActionsProps> = ({
  notification,
  onActionComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickAction = async (action: string, data?: any) => {
    setIsLoading(true);
    try {
      // Ici vous pouvez implémenter les actions spécifiques
      // selon le type et la catégorie de la notification
      console.log(`Action ${action} sur notification ${notification.id}`, data);
      
      // Simulation d'action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Action ${action} effectuée avec succès`);
      onActionComplete();
    } catch (error) {
      console.error(`Erreur action ${action}:`, error);
      toast.error(`Erreur lors de l'action ${action}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionButtons = () => {
    switch (notification.type) {
      case 'user_management':
        switch (notification.category) {
          case 'new_user':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('approve_user', { userId: notification.userId })}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('view_user', { userId: notification.userId })}
                  disabled={isLoading}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Voir profil
                </Button>
              </div>
            );
          case 'verification_request':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('verify_company', { companyId: notification.data?.entreprise?.id })}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Vérifier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('reject_verification', { companyId: notification.data?.entreprise?.id })}
                  disabled={isLoading}
                >
                  <X className="w-3 h-3 mr-1" />
                  Rejeter
                </Button>
              </div>
            );
          case 'user_suspension':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('unsuspend_user', { userId: notification.userId })}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Réactiver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('view_user', { userId: notification.userId })}
                  disabled={isLoading}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Voir profil
                </Button>
              </div>
            );
          case 'user_report':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('investigate_report', { reportId: notification.id })}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Enquêter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('dismiss_report', { reportId: notification.id })}
                  disabled={isLoading}
                >
                  <X className="w-3 h-3 mr-1" />
                  Ignorer
                </Button>
              </div>
            );
          default:
            return null;
        }

      case 'product_management':
        switch (notification.category) {
          case 'product_moderation':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('approve_product', { productId: notification.productId })}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('reject_product', { productId: notification.productId })}
                  disabled={isLoading}
                >
                  <X className="w-3 h-3 mr-1" />
                  Rejeter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('view_product', { productId: notification.productId })}
                  disabled={isLoading}
                >
                  <Package className="w-3 h-3 mr-1" />
                  Voir produit
                </Button>
              </div>
            );
          case 'product_report':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('investigate_product_report', { productId: notification.productId })}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Enquêter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('view_product', { productId: notification.productId })}
                  disabled={isLoading}
                >
                  <Package className="w-3 h-3 mr-1" />
                  Voir produit
                </Button>
              </div>
            );
          case 'product_modification_request':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('approve_modifications', { productId: notification.productId })}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('view_product', { productId: notification.productId })}
                  disabled={isLoading}
                >
                  <Package className="w-3 h-3 mr-1" />
                  Voir produit
                </Button>
              </div>
            );
          default:
            return null;
        }

      case 'system':
        switch (notification.category) {
          case 'system_error':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('investigate_error', { errorId: notification.id })}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Enquêter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('view_logs', { errorId: notification.id })}
                  disabled={isLoading}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Voir logs
                </Button>
              </div>
            );
          case 'security_alert':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('investigate_security', { alertId: notification.id })}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Enquêter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('view_security_logs', { alertId: notification.id })}
                  disabled={isLoading}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Voir logs
                </Button>
              </div>
            );
          case 'performance_stats':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('view_performance', { statsId: notification.id })}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Voir rapport
                </Button>
              </div>
            );
          case 'maintenance':
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleQuickAction('schedule_maintenance', { maintenanceId: notification.id })}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Planifier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('view_maintenance', { maintenanceId: notification.id })}
                  disabled={isLoading}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Voir détails
                </Button>
              </div>
            );
          default:
            return null;
        }

      case 'order_management':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleQuickAction('view_order', { orderId: notification.orderId })}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Voir commande
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('process_order', { orderId: notification.orderId })}
              disabled={isLoading}
            >
              <Check className="w-3 h-3 mr-1" />
              Traiter
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getPriorityBadge = () => {
    switch (notification.priority) {
      case 'urgent':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Urgent
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="outline" className="text-xs text-orange-600 bg-orange-50 border-orange-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Élevée
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Moyenne
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="text-xs text-green-600 bg-green-50 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Faible
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={`${!notification.isRead ? 'bg-blue-50/50 border-blue-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {adminNotificationService.getNotificationIcon(notification.type, notification.category)}
            </span>
            <CardTitle className="text-sm">{notification.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge()}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {notification.message}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(notification.createdAt).toLocaleString('fr-FR')}
          </span>
          
          <div className="flex items-center gap-2">
            {getActionButtons()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
