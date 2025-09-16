import { useState } from "react";
import { Building, Mail, Phone, MapPin, Globe, FileText, CreditCard, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupplierProfile, useUpdateSupplierProfile, useCompleteSupplierProfile } from "@/hooks/api/useSupplierProfile";
import ProfilePhotoUpload from "@/components/profile/ProfilePhotoUpload";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { toast } from "sonner";

export const SupplierProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  
  const { data: profile, isLoading, error } = useSupplierProfile();
  const updateProfileMutation = useUpdateSupplierProfile();
  const completeProfileMutation = useCompleteSupplierProfile();
  
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = async () => {
    try {
      if (profile?.nom_entreprise) {
        // Mise à jour du profil existant
        await updateProfileMutation.mutateAsync(editData);
        toast.success('Profil mis à jour avec succès');
      } else {
        // Création du profil entreprise
        await completeProfileMutation.mutateAsync(editData);
        toast.success('Profil entreprise créé avec succès');
      }
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profil entreprise non configuré
            </h3>
            <p className="text-gray-600 mb-4">
              Complétez votre profil entreprise pour commencer à vendre
            </p>
            <Button onClick={handleEdit} className="bg-green-600 hover:bg-green-700">
              <Building className="w-4 h-4 mr-2" />
              Configurer mon entreprise
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getVerificationBadge = (statut: string) => {
    switch (statut) {
      case 'verifie':
        return <Badge className="bg-green-100 text-green-800">✓ Vérifié</Badge>;
      case 'en_attente':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ En attente</Badge>;
      case 'rejete':
        return <Badge className="bg-red-100 text-red-800">✗ Rejeté</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Non vérifié</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profil de l'entreprise</h2>
          <p className="text-gray-600">Gérez les informations de votre entreprise</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={updateProfileMutation.isPending || completeProfileMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateProfileMutation.isPending || completeProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Photo de profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
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

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informations générales
            {profile.statut_verification && getVerificationBadge(profile.statut_verification)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise
              </label>
              {isEditing ? (
                <Input
                  value={editData.nom_entreprise || ''}
                  onChange={(e) => handleInputChange('nom_entreprise', e.target.value)}
                  placeholder="Nom de votre entreprise"
                />
              ) : (
                <p className="text-gray-900">{profile.nom_entreprise || 'Non renseigné'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secteur d'activité
              </label>
              <p className="text-gray-900">{profile.secteur_activite || 'Non renseigné'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'entreprise
              </label>
              <p className="text-gray-900">{profile.type_entreprise || 'Non renseigné'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année de création
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editData.annee_creation || ''}
                  onChange={(e) => handleInputChange('annee_creation', e.target.value)}
                  placeholder="2020"
                />
              ) : (
                <p className="text-gray-900">{profile.annee_creation || 'Non renseigné'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            {isEditing ? (
              <Textarea
                value={editData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre entreprise..."
                rows={3}
              />
            ) : (
              <p className="text-gray-900">{profile.description || 'Aucune description'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Informations de contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <p className="text-gray-900">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone professionnel
              </label>
              {isEditing ? (
                <Input
                  value={editData.telephone_professionnel || ''}
                  onChange={(e) => handleInputChange('telephone_professionnel', e.target.value)}
                  placeholder="+241 XX XX XX XX"
                />
              ) : (
                <p className="text-gray-900">{profile.telephone_professionnel || 'Non renseigné'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-4 h-4 inline mr-1" />
                Site web
              </label>
              {isEditing ? (
                <Input
                  value={editData.site_web || ''}
                  onChange={(e) => handleInputChange('site_web', e.target.value)}
                  placeholder="https://www.votre-site.com"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.site_web ? (
                    <a href={profile.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile.site_web}
                    </a>
                  ) : (
                    'Non renseigné'
                  )}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adresse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Adresse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse complète
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editData.adresse_ligne1 || ''}
                  onChange={(e) => handleInputChange('adresse_ligne1', e.target.value)}
                  placeholder="Adresse ligne 1"
                />
                <Input
                  value={editData.adresse_ligne2 || ''}
                  onChange={(e) => handleInputChange('adresse_ligne2', e.target.value)}
                  placeholder="Adresse ligne 2 (optionnel)"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={editData.ville || ''}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                    placeholder="Ville"
                  />
                  <Input
                    value={editData.code_postal || ''}
                    onChange={(e) => handleInputChange('code_postal', e.target.value)}
                    placeholder="Code postal"
                  />
                  <Input
                    value={editData.pays || 'Gabon'}
                    onChange={(e) => handleInputChange('pays', e.target.value)}
                    placeholder="Pays"
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-900">
                <p>{profile.adresse_ligne1}</p>
                {profile.adresse_ligne2 && <p>{profile.adresse_ligne2}</p>}
                <p>{profile.ville} {profile.code_postal}</p>
                <p>{profile.pays}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informations légales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informations légales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro SIRET
              </label>
              {isEditing ? (
                <Input
                  value={editData.numero_siret || ''}
                  onChange={(e) => handleInputChange('numero_siret', e.target.value)}
                  placeholder="Numéro SIRET"
                />
              ) : (
                <p className="text-gray-900">{profile.numero_siret || 'Non renseigné'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro TVA
              </label>
              {isEditing ? (
                <Input
                  value={editData.numero_tva || ''}
                  onChange={(e) => handleInputChange('numero_tva', e.target.value)}
                  placeholder="Numéro TVA"
                />
              ) : (
                <p className="text-gray-900">{profile.numero_tva || 'Non renseigné'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations bancaires */}
      {(profile.nom_banque || profile.iban || isEditing) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informations bancaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la banque
                </label>
                {isEditing ? (
                  <Input
                    value={editData.nom_banque || ''}
                    onChange={(e) => handleInputChange('nom_banque', e.target.value)}
                    placeholder="Ex: BGFI Bank"
                  />
                ) : (
                  <p className="text-gray-900">{profile.nom_banque || 'Non renseigné'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titulaire du compte
                </label>
                {isEditing ? (
                  <Input
                    value={editData.nom_titulaire_compte || ''}
                    onChange={(e) => handleInputChange('nom_titulaire_compte', e.target.value)}
                    placeholder="Nom du titulaire"
                  />
                ) : (
                  <p className="text-gray-900">{profile.nom_titulaire_compte || 'Non renseigné'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN
                </label>
                {isEditing ? (
                  <Input
                    value={editData.iban || ''}
                    onChange={(e) => handleInputChange('iban', e.target.value)}
                    placeholder="GA21 1234 5678 9012 3456 7890 12"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">
                    {profile.iban ? `****${profile.iban.slice(-4)}` : 'Non renseigné'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};