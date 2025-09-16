import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  Mail,
  Phone,
  Settings,
  Save,
  X,
  Camera,
  Key,
  Bell,
  Database,
  Activity,
  Users,
  BarChart3,
  FileText,
  LogOut,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import AdminProfilePhotoUpload from "@/components/admin/AdminProfilePhotoUpload";
import { useCurrentUser, useLogout } from "@/hooks/api/useAuth";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";

interface AdminStats {
  total_fournisseurs: number;
  total_acheteurs: number;
  total_produits: number;
  total_commandes: number;
  notifications_non_lues: number;
}

const AdminProfile = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: ""
  });

  // Hook pour la photo de profil
  const { photoData, refetch: refetchPhoto } = useProfilePhoto();

  // Récupérer les statistiques admin
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/stats');
      return response as AdminStats;
    }
  });

  // Récupérer les notifications admin
  const { data: notifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/notifications?limit=5');
      return response.notifications || [];
    }
  });

  // Initialiser les données du formulaire
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        telephone: user.telephone || ""
      });
    }
  }, [user]);

  // Fonctions de gestion de la photo de profil
  const handlePhotoUpdate = (photoPath: string) => {
    toast.success('Photo de profil mise à jour avec succès !');
    refetchPhoto();
  };

  const handlePhotoDelete = () => {
    toast.success('Photo de profil supprimée avec succès !');
    refetchPhoto();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nom: user?.nom || "",
      prenom: user?.prenom || "",
      email: user?.email || "",
      telephone: user?.telephone || ""
    });
  };

  const handleSave = async () => {
    try {
      await apiClient.put('/users/profile', formData);
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    toast.success("Déconnexion réussie");
    navigate("/admin/login");
  };

  const getStatusBadge = () => {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <Shield className="w-3 h-3 mr-1" />
        Administrateur
      </Badge>
    );
  };

  const getActivityStatus = () => {
    const now = new Date();
    const lastLogin = user?.last_login ? new Date(user.last_login) : null;
    
    if (!lastLogin) return { status: 'inactive', text: 'Jamais connecté', color: 'text-gray-500' };
    
    const diffMinutes = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return { status: 'online', text: 'En ligne', color: 'text-green-500' };
    if (diffMinutes < 60) return { status: 'recent', text: 'Récemment actif', color: 'text-blue-500' };
    if (diffMinutes < 1440) return { status: 'today', text: 'Aujourd\'hui', color: 'text-yellow-500' };
    
    return { status: 'offline', text: 'Hors ligne', color: 'text-gray-500' };
  };

  const activityStatus = getActivityStatus();

  if (userLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profil Administrateur</h1>
              <p className="text-red-100">Gérez votre compte administrateur et les paramètres système</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${activityStatus.color.replace('text-', 'bg-')}`}></div>
                <span className="text-sm">{activityStatus.text}</span>
              </div>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo de profil */}
            <AdminProfilePhotoUpload
              currentPhoto={photoData?.photo_profil}
              onPhotoUpdate={handlePhotoUpdate}
              onPhotoDelete={handlePhotoDelete}
              size="xl"
            />

            {/* Statistiques rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Utilisateurs</span>
                      <span className="font-semibold">{stats?.total_acheteurs + stats?.total_fournisseurs || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fournisseurs</span>
                      <span className="font-semibold text-blue-600">{stats?.total_fournisseurs || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Acheteurs</span>
                      <span className="font-semibold text-green-600">{stats?.total_acheteurs || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Produits</span>
                      <span className="font-semibold text-purple-600">{stats?.total_produits || 0}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gérer les utilisateurs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Tableau de bord
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/notifications')}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="personal">Informations</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <p className="text-gray-900">{user?.nom || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                        <p className="text-gray-900">{user?.prenom || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900">{user?.email || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <p className="text-gray-900">{user?.telephone || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button onClick={handleEdit}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier les informations
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications récentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notifications && notifications.length > 0 ? (
                      <div className="space-y-3">
                        {notifications.slice(0, 3).map((notification: any) => (
                          <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              {notification.type === 'user_management' && <Users className="w-4 h-4 text-blue-500" />}
                              {notification.type === 'product_management' && <FileText className="w-4 h-4 text-green-500" />}
                              {notification.type === 'system' && <Database className="w-4 h-4 text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{notification.titre}</p>
                              <p className="text-xs text-gray-500">{notification.message}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className="text-xs text-gray-400">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucune notification récente</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Informations personnelles */}
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Détails du compte
                      </CardTitle>
                      {!isEditing ? (
                        <Button onClick={handleEdit}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      {isEditing ? (
                        <Input
                          value={formData.nom}
                          onChange={(e) => handleInputChange('nom', e.target.value)}
                          placeholder="Votre nom"
                        />
                      ) : (
                        <p className="text-gray-900">{user?.nom || 'Non renseigné'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      {isEditing ? (
                        <Input
                          value={formData.prenom}
                          onChange={(e) => handleInputChange('prenom', e.target.value)}
                          placeholder="Votre prénom"
                        />
                      ) : (
                        <p className="text-gray-900">{user?.prenom || 'Non renseigné'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="votre@email.com"
                        />
                      ) : (
                        <p className="text-gray-900">{user?.email || 'Non renseigné'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      {isEditing ? (
                        <Input
                          value={formData.telephone}
                          onChange={(e) => handleInputChange('telephone', e.target.value)}
                          placeholder="+241 XX XX XX XX"
                        />
                      ) : (
                        <p className="text-gray-900">{user?.telephone || 'Non renseigné'}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge()}
                        <span className="text-sm text-gray-500">
                          Accès complet à l'administration
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sécurité */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Sécurité du compte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Mot de passe</h4>
                          <p className="text-sm text-yellow-600">Dernière modification il y a plus de 90 jours</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-green-800">Authentification à deux facteurs</h4>
                          <p className="text-sm text-green-600">Activée et configurée</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Gérer
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-blue-800">Sessions actives</h4>
                          <p className="text-sm text-blue-600">2 sessions actives</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Voir toutes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activité */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nouveau fournisseur inscrit</p>
                          <p className="text-xs text-gray-500">Il y a 2 heures</p>
                        </div>
                        <Badge variant="outline">Utilisateurs</Badge>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <FileText className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Produit approuvé</p>
                          <p className="text-xs text-gray-500">Il y a 4 heures</p>
                        </div>
                        <Badge variant="outline">Produits</Badge>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Database className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Sauvegarde système</p>
                          <p className="text-xs text-gray-500">Hier à 23:30</p>
                        </div>
                        <Badge variant="outline">Système</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
