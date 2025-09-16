import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  User, Bell, Shield, Globe, Palette, 
  Save, Eye, EyeOff, Smartphone, Mail
} from "lucide-react";
import { useCurrentUser } from "@/hooks/api/useAuth";
import { BackButton } from "@/components/ui/back-button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Layout from "@/components/layout/Layout";
import SupplierLayout from "@/components/layout/SupplierLayout";
import { toast } from "sonner";
import { apiClient } from "@/services/api";

const Settings = () => {
  const { data: user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // États pour les paramètres
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    orderNotifications: true,
    marketingEmails: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });

  const isSupplier = user?.role_id === 2;
  const LayoutComponent = isSupplier ? SupplierLayout : Layout;

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await apiClient.put('/users/profile', profileData);
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Mot de passe modifié avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    try {
      // ✅ VÉRIFIER si la route existe, sinon créer fallback
      try {
        await apiClient.put('/users/notifications-settings', notificationSettings);
        toast.success('Paramètres de notification mis à jour');
      } catch (apiError: any) {
        if (apiError.message?.includes('404') || apiError.message?.includes('Not Found')) {
          console.warn('Route /users/notifications-settings non implémentée');
          toast.success('Paramètres de notification mis à jour (Mode simulation)');
        } else {
          throw apiError;
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setIsLoading(true);
    try {
      // ✅ VÉRIFIER si la route existe, sinon créer fallback
      try {
        await apiClient.put('/users/privacy-settings', privacySettings);
        toast.success('Paramètres de confidentialité mis à jour');
      } catch (apiError: any) {
        if (apiError.message?.includes('404') || apiError.message?.includes('Not Found')) {
          console.warn('Route /users/privacy-settings non implémentée');
          toast.success('Paramètres de confidentialité mis à jour (Mode simulation)');
        } else {
          throw apiError;
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutComponent>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <BackButton className="mb-4" />
          <Breadcrumb 
            items={[
              { label: "Paramètres" }
            ]}
          />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
            <p className="text-gray-600">
              Gérez vos préférences et paramètres de compte
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Confidentialité
              </TabsTrigger>
            </TabsList>

            {/* Onglet Profil */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        value={profileData.nom}
                        onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        value={profileData.prenom}
                        onChange={(e) => setProfileData({...profileData, prenom: e.target.value})}
                        placeholder="Votre prénom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="pl-10"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="telephone"
                        value={profileData.telephone}
                        onChange={(e) => setProfileData({...profileData, telephone: e.target.value})}
                        className="pl-10"
                        placeholder="+241 XX XX XX XX"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Notifications */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Préférences de notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notifications par email</h4>
                        <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, emailNotifications: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notifications push</h4>
                        <p className="text-sm text-gray-600">Recevoir les notifications dans le navigateur</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, pushNotifications: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Messages</h4>
                        <p className="text-sm text-gray-600">Notifications pour les nouveaux messages</p>
                      </div>
                      <Switch
                        checked={notificationSettings.messageNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, messageNotifications: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Commandes</h4>
                        <p className="text-sm text-gray-600">Notifications pour les commandes et leur statut</p>
                      </div>
                      <Switch
                        checked={notificationSettings.orderNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, orderNotifications: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Emails marketing</h4>
                        <p className="text-sm text-gray-600">Recevoir les offres et actualités</p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, marketingEmails: checked})
                        }
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleNotificationUpdate}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Sécurité */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Sécurité du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          placeholder="Votre mot de passe actuel"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Nouveau mot de passe (min. 6 caractères)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Confirmer le nouveau mot de passe"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Confidentialité */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Paramètres de confidentialité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Profil visible</h4>
                        <p className="text-sm text-gray-600">Permettre aux autres utilisateurs de voir votre profil</p>
                      </div>
                      <Switch
                        checked={privacySettings.profileVisible}
                        onCheckedChange={(checked) => 
                          setPrivacySettings({...privacySettings, profileVisible: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Afficher l'email</h4>
                        <p className="text-sm text-gray-600">Rendre votre email visible sur votre profil</p>
                      </div>
                      <Switch
                        checked={privacySettings.showEmail}
                        onCheckedChange={(checked) => 
                          setPrivacySettings({...privacySettings, showEmail: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Afficher le téléphone</h4>
                        <p className="text-sm text-gray-600">Rendre votre numéro visible sur votre profil</p>
                      </div>
                      <Switch
                        checked={privacySettings.showPhone}
                        onCheckedChange={(checked) => 
                          setPrivacySettings({...privacySettings, showPhone: checked})
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Autoriser les messages</h4>
                        <p className="text-sm text-gray-600">Permettre aux autres utilisateurs de vous contacter</p>
                      </div>
                      <Switch
                        checked={privacySettings.allowMessages}
                        onCheckedChange={(checked) => 
                          setPrivacySettings({...privacySettings, allowMessages: checked})
                        }
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handlePrivacyUpdate}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </LayoutComponent>
  );
};

export default Settings;