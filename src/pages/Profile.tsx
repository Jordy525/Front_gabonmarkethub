import { useState, useEffect } from "react";
import {
  User, Mail, Phone, Building, Edit, Save, X, Package,
  Shield, Globe, MapPin, Calendar, Users, Award,
  TrendingUp, Bell, Settings, LogOut, Eye, FileText, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser, useUpdateProfile, useLogout } from "@/hooks/api/useAuth";
import { useEntreprise, useUpdateEntreprise } from "@/hooks/api/useEntreprise";
import { useNotifications } from "@/hooks/api/useDashboard";
import { CompanyInfoForm } from "@/components/supplier/CompanyInfoForm";
import ProfilePhotoUpload from "@/components/profile/ProfilePhotoUpload";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import SupplierLayout from "@/components/layout/SupplierLayout";
import { apiClient } from "@/services/api";

const Profile = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const isSupplier = user?.role_id === 2;
  const [activeTab, setActiveTab] = useState("personal");
  const [secteurs, setSecteurs] = useState<any[]>([]);
  const [typesEntreprise, setTypesEntreprise] = useState<any[]>([]);
  
  // Hook pour la photo de profil
  const { photoData, refetch: refetchPhoto } = useProfilePhoto();

  // Fonctions de gestion de la photo de profil
  const handlePhotoUpdate = (photoPath: string) => {
    toast.success('Photo de profil mise à jour avec succès !');
    refetchPhoto();
  };

  const handlePhotoDelete = () => {
    toast.success('Photo de profil supprimée avec succès !');
    refetchPhoto();
  };

  // Debug: voir la structure des données entreprise
  useEffect(() => {
    if (user?.entreprise) {
      console.log('🏢 Données entreprise reçues:', user.entreprise);
      console.log('📊 Secteur activité:', user.entreprise.secteur_activite);
      console.log('🏭 Type entreprise:', user.entreprise.type_entreprise);
    }
  }, [user]);

  // Charger les secteurs et types pour l'affichage
  useEffect(() => {
    if (isSupplier) {
      loadSecteurs();
      loadTypesEntreprise();
    }
  }, [isSupplier]);

  const loadSecteurs = async () => {
    try {
      const response = await apiClient.get('/supplier/secteurs');
      const secteurs = response.secteurs || response.data?.secteurs || [];
      setSecteurs(secteurs);
    } catch (error) {
      console.error('Erreur chargement secteurs:', error);
    }
  };

  const loadTypesEntreprise = async () => {
    try {
      const response = await apiClient.get('/supplier/types-entreprise');
      const types = response.types || response.data?.types || [];
      setTypesEntreprise(types);
    } catch (error) {
      console.error('Erreur chargement types entreprise:', error);
    }
  };

  // Fonction pour obtenir le nom du secteur par ID
  const getSecteurNom = (secteurId: number) => {
    const secteur = secteurs.find(s => s.id === secteurId);
    return secteur?.nom || `Secteur ID: ${secteurId}`;
  };

  // Fonction pour obtenir le nom du type d'entreprise par ID
  const getTypeEntrepriseNom = (typeId: number) => {
    const type = typesEntreprise.find(t => t.id === typeId);
    return type?.nom || `Type ID: ${typeId}`;
  };
  const { data: entreprise } = useEntreprise(user?.entreprise?.id || 0);

  // Changer l'onglet par défaut pour les fournisseurs
  useEffect(() => {
    if (user && isSupplier) {
      setActiveTab("company");
    }
  }, [user, isSupplier]);
  const { data: notifications } = useNotifications();
  const updateProfileMutation = useUpdateProfile();
  const updateEntrepriseMutation = useUpdateEntreprise();
  const logoutMutation = useLogout();

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: ""
  });

  // Mettre à jour formData quand user change
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        telephone: user.telephone || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const LayoutComponent = isSupplier ? SupplierLayout : ResponsiveLayout;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };



  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        telephone: user.telephone || "",
        email: user.email || ""
      });
    }
    setIsEditing(false);
  };

  const handleCompanySave = () => {
    setIsEditingCompany(false);
    // Recharger les données utilisateur pour refléter les changements
    window.location.reload();
  };

  const handleCompanyCancel = () => {
    setIsEditingCompany(false);
  };

  if (isLoading) {
    return (
      <LayoutComponent>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Chargement du profil...</p>
          </div>
        </div>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="text-center mb-4 lg:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {user?.nom} {user?.prenom}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
                  <Badge variant="outline" className="mt-2 text-xs bg-green-50 text-green-700">
                    {isSupplier ? 'Fournisseur' : 'Acheteur'}
                  </Badge>
                </div>

                {/* Navigation mobile */}
                <div className="lg:hidden mb-4">
                  <div className="flex overflow-x-auto space-x-2 pb-2">
                    {[
                      { key: "personal", icon: User, label: "Personnel" },
                      { key: "company", icon: Building, label: "Entreprise" },
                      { key: "security", icon: Shield, label: "Sécurité" },
                      { key: "preferences", icon: Settings, label: "Préférences" }
                    ].map((item) => (
                      <Button
                        key={item.key}
                        variant={activeTab === item.key ? "default" : "ghost"}
                        size="sm"
                        className="flex-shrink-0 px-3"
                        onClick={() => setActiveTab(item.key)}
                      >
                        <item.icon className="w-4 h-4 mr-1" />
                        <span className="text-xs">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Navigation desktop */}
                <nav className="hidden lg:block space-y-2">
                  <Button
                    variant={activeTab === "personal" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab("personal")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Informations personnelles
                  </Button>

                  {isSupplier && (
                    <Button
                      variant={activeTab === "company" ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => setActiveTab("company")}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Informations entreprise
                    </Button>
                  )}

                  <Button
                    variant={activeTab === "security" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Sécurité
                  </Button>

                  <Button
                    variant={activeTab === "preferences" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab("preferences")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Préférences
                  </Button>

                  {isSupplier && (
                    <Button
                      variant={activeTab === "documents" ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => setActiveTab("documents")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Documents
                    </Button>
                  )}
                </nav>

                <div className="mt-4 lg:mt-8 pt-4 lg:pt-6 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 logout-button"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    data-logout="true"
                  >
                    <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {logoutMutation.isPending ? "Déconnexion..." : "Se déconnecter"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {activeTab === "personal" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          Informations personnelles 👤
                        </h1>
                        <p className="text-gray-600">
                          Gérez vos informations personnelles et de contact
                        </p>
                      </div>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSave}
                            disabled={updateProfileMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updateProfileMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Photo de profil */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Photo de profil
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProfilePhotoUpload
                        currentPhoto={photoData?.photo_profil}
                        onPhotoUpdate={handlePhotoUpdate}
                        onPhotoDelete={handlePhotoDelete}
                        size="lg"
                        className="justify-center"
                      />
                    </CardContent>
                  </Card>

                  {/* Informations personnelles */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Détails du compte
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <Input
                          name="nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Votre nom"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <Input
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Votre prénom"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="+241 XX XX XX XX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rôle
                        </label>
                        <Input
                          value={isSupplier ? "Fournisseur" : "Acheteur"}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'inscription
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            value={user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Non disponible'}
                            disabled
                            className="bg-gray-50 pl-10"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "company" && isSupplier && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          Informations entreprise 🏢
                        </h1>
                        <p className="text-gray-600">
                          Gérez les informations de votre entreprise et votre profil fournisseur
                        </p>
                      </div>
                      {!isEditingCompany && (
                        <Button onClick={() => setIsEditingCompany(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      )}
                    </div>
                  </div>

                  {isEditingCompany ? (
                    <CompanyInfoForm
                      initialData={user?.entreprise}
                      onSave={handleCompanySave}
                      onCancel={handleCompanyCancel}
                    />
                  ) : (
                    <>
                      {/* Informations générales */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Building className="w-5 h-5 mr-2" />
                            Informations générales
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom de l'entreprise
                            </label>
                            <Input
                              value={user?.entreprise?.nom_entreprise || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <Input
                              value={user?.entreprise?.description || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Site web
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                value={user?.entreprise?.site_web || 'Non renseigné'}
                                disabled
                                className="bg-gray-50 pl-10"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Téléphone professionnel
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                                value={user?.entreprise?.telephone_professionnel || 'Non renseigné'}
                                disabled
                                className="bg-gray-50 pl-10"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Secteur d'activité
                            </label>
                            <Input
                              value={
                                user?.entreprise?.secteur_activite?.nom || 
                                (user?.entreprise?.secteur_activite_id ? getSecteurNom(user.entreprise.secteur_activite_id) : 'Non renseigné')
                              }
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type d'entreprise
                            </label>
                            <Input
                              value={
                                user?.entreprise?.type_entreprise?.nom || 
                                (user?.entreprise?.type_entreprise_id ? getTypeEntrepriseNom(user.entreprise.type_entreprise_id) : 'Non renseigné')
                              }
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Logo de l'entreprise
                            </label>
                            <div className="flex items-center gap-3">
                              {user?.entreprise?.logo_url ? (
                                <img
                                  src={user.entreprise.logo_url}
                                  alt="Logo entreprise"
                                  className="w-12 h-12 object-cover rounded-lg border"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Building className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <Input
                                value={user?.entreprise?.logo_url ? 'Logo configuré' : 'Aucun logo'}
                                disabled
                                className="bg-gray-50 flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Statut de vérification
                            </label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={user?.entreprise?.statut_verification === 'verifie' ? 'Vérifié' :
                                  user?.entreprise?.statut_verification === 'rejete' ? 'Rejeté' : 'En attente'}
                                disabled
                                className="bg-gray-50"
                              />
                              {user?.entreprise?.statut_verification === 'verifie' && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Vérifié
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Informations légales */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Informations légales
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Numéro SIRET
                            </label>
                            <Input
                              value={user?.entreprise?.numero_siret || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Numéro TVA
                            </label>
                            <Input
                              value={user?.entreprise?.numero_tva || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Registre de commerce
                            </label>
                            <Input
                              value={user?.entreprise?.numero_registre_commerce || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Année de création
                            </label>
                            <Input
                              value={user?.entreprise?.annee_creation || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Adresse */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Adresse de l'entreprise
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Adresse ligne 1
                            </label>
                            <Input
                              value={user?.entreprise?.adresse_ligne1 || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Adresse ligne 2
                            </label>
                            <Input
                              value={user?.entreprise?.adresse_ligne2 || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ville
                            </label>
                            <Input
                              value={user?.entreprise?.ville || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Code postal
                            </label>
                            <Input
                              value={user?.entreprise?.code_postal || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pays
                            </label>
                            <Input
                              value={user?.entreprise?.pays || 'Gabon'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Informations complémentaires */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Informations complémentaires
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre d'employés
                            </label>
                            <Input
                              value={user?.entreprise?.nombre_employes || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Capacité de production
                            </label>
                            <Input
                              value={user?.entreprise?.capacite_production || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Certifications
                            </label>
                            <Input
                              value={user?.entreprise?.certifications || 'Aucune certification renseignée'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Informations bancaires */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            Informations bancaires
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom de la banque
                            </label>
                            <Input
                              value={user?.entreprise?.nom_banque || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom du titulaire du compte
                            </label>
                            <Input
                              value={user?.entreprise?.nom_titulaire_compte || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              IBAN
                            </label>
                            <Input
                              value={user?.entreprise?.iban || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Code BIC/SWIFT
                            </label>
                            <Input
                              value={user?.entreprise?.bic_swift || 'Non renseigné'}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Sécurité du compte 🔒
                    </h1>
                    <p className="text-gray-600">
                      Gérez la sécurité de votre compte et vos paramètres de confidentialité
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Paramètres de sécurité
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Accédez aux paramètres complets pour gérer votre sécurité
                        </p>
                        <Button
                          onClick={() => navigate('/settings')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Ouvrir les paramètres
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Préférences ⚙️
                    </h1>
                    <p className="text-gray-600">
                      Personnalisez votre expérience sur la plateforme
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Paramètres avancés
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Configurez vos notifications, confidentialité et préférences
                        </p>
                        <Button
                          onClick={() => navigate('/settings')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Ouvrir les paramètres
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "documents" && isSupplier && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Documents de vérification 📄
                    </h1>
                    <p className="text-gray-600">
                      Téléchargez vos documents officiels pour la vérification de votre compte
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Gestion des documents
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Accédez au tableau de bord pour gérer vos documents
                        </p>
                        <Button
                          onClick={() => navigate('/supplier/dashboard')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Aller au tableau de bord
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
};

export default Profile;