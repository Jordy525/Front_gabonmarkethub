import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Database,
  Shield,
  Mail,
  Bell,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Configuration générale
    siteName: "GabMarketHub",
    siteDescription: "Plateforme e-commerce du Gabon",
    maintenanceMode: false,
    
    // Configuration email
    emailEnabled: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    
    // Configuration sécurité
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    
    // Configuration notifications
    emailNotifications: true,
    pushNotifications: true,
    adminNotifications: true,
    
    // Configuration système
    maxFileSize: 10,
    allowedFileTypes: "jpg,jpeg,png,pdf,doc,docx",
    autoBackup: true,
    backupFrequency: "daily"
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Paramètres sauvegardés avec succès");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    toast.info("Paramètres réinitialisés");
  };

  return (
    <AdminLayout activeTab="settings" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Paramètres système ⚙️
            </h1>
            <p className="text-gray-600">
              Configuration de la plateforme et des paramètres administratifs
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Configuration générale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Configuration générale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Nom du site</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                <p className="text-sm text-gray-500">
                  Désactive l'accès public au site
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Configuration email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailEnabled">Activer les emails</Label>
                <p className="text-sm text-gray-500">
                  Permettre l'envoi d'emails automatiques
                </p>
              </div>
              <Switch
                id="emailEnabled"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => setSettings({...settings, emailEnabled: checked})}
              />
            </div>

            {settings.emailEnabled && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">Serveur SMTP</Label>
                    <Input
                      id="smtpHost"
                      value={settings.smtpHost}
                      onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">Port SMTP</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpUser">Utilisateur SMTP</Label>
                    <Input
                      id="smtpUser"
                      type="email"
                      value={settings.smtpUser}
                      onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.smtpPassword}
                      onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Configuration sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Configuration sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxLoginAttempts">Tentatives de connexion max</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Timeout session (heures)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireEmailVerification">Vérification email obligatoire</Label>
                  <p className="text-sm text-gray-500">
                    Les utilisateurs doivent vérifier leur email
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requirePhoneVerification">Vérification téléphone obligatoire</Label>
                  <p className="text-sm text-gray-500">
                    Les utilisateurs doivent vérifier leur téléphone
                  </p>
                </div>
                <Switch
                  id="requirePhoneVerification"
                  checked={settings.requirePhoneVerification}
                  onCheckedChange={(checked) => setSettings({...settings, requirePhoneVerification: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Configuration notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Notifications email</Label>
                  <p className="text-sm text-gray-500">
                    Envoyer des notifications par email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Notifications push</Label>
                  <p className="text-sm text-gray-500">
                    Notifications en temps réel dans le navigateur
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="adminNotifications">Notifications admin</Label>
                  <p className="text-sm text-gray-500">
                    Notifications pour les administrateurs
                  </p>
                </div>
                <Switch
                  id="adminNotifications"
                  checked={settings.adminNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, adminNotifications: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Configuration système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxFileSize">Taille max fichier (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="allowedFileTypes">Types de fichiers autorisés</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Sauvegarde automatique</Label>
                  <p className="text-sm text-gray-500">
                    Sauvegarder automatiquement la base de données
                  </p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                />
              </div>

              {settings.autoBackup && (
                <div>
                  <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                  <select
                    id="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statut système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Statut système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Base de données</p>
                  <p className="text-sm text-green-600">Connectée</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Serveur email</p>
                  <p className="text-sm text-green-600">Opérationnel</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Sauvegarde</p>
                  <p className="text-sm text-yellow-600">En attente</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
