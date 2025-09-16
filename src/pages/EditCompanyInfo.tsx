// Page de modification des informations d'entreprise pour les fournisseurs
import { useState, useEffect } from 'react';
import { Building, User, Phone, MapPin, FileText, Globe, Save, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/SimpleSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/services/api';
import Layout from '@/components/layout/Layout';

interface Secteur {
  id: number;
  nom: string;
  description: string;
}

interface TypeEntreprise {
  id: number;
  nom: string;
  description: string;
}

interface CompanyData {
  id?: number;
  nom_entreprise: string;
  description: string;
  logo: File | null;
  logo_url: string;
  site_web: string;
  numero_siret: string;
  numero_registre_commerce: string;
  numero_tva: string;
  telephone_professionnel: string;
  
  // Adresse
  adresse_ligne1: string;
  adresse_ligne2: string;
  ville: string;
  code_postal: string;
  pays: string;
  
  // Relations
  secteur_activite_id: string;
  type_entreprise_id: string;
  
  // Informations complémentaires
  annee_creation: string;
  nombre_employes: string;
  capacite_production: string;
  certifications: string;
  
  // Informations bancaires
  nom_banque: string;
  iban: string;
  nom_titulaire_compte: string;
  bic_swift: string;
  
  // Statut
  statut_verification: string;
}

const EditCompanyInfo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [typesEntreprise, setTypesEntreprise] = useState<TypeEntreprise[]>([]);
  const [hasExistingCompany, setHasExistingCompany] = useState(false);
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState<CompanyData>({
    nom_entreprise: '',
    description: '',
    logo: null,
    logo_url: '',
    site_web: '',
    numero_siret: '',
    numero_registre_commerce: '',
    numero_tva: '',
    telephone_professionnel: '',
    
    // Adresse
    adresse_ligne1: '',
    adresse_ligne2: '',
    ville: '',
    code_postal: '',
    pays: 'Gabon',
    
    // Relations
    secteur_activite_id: '',
    type_entreprise_id: '',
    
    // Informations complémentaires
    annee_creation: '',
    nombre_employes: '',
    capacite_production: '',
    certifications: '',
    
    // Informations bancaires
    nom_banque: '',
    iban: '',
    nom_titulaire_compte: '',
    bic_swift: '',
    
    // Statut
    statut_verification: 'en_attente'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true);
      
      // Charger les données de référence
      await Promise.all([
        loadSecteurs(),
        loadTypesEntreprise(),
        loadCompanyData()
      ]);
      
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadSecteurs = async () => {
    try {
      const response = await apiClient.get('/supplier/secteurs');
      setSecteurs((response as any).data?.secteurs || []);
    } catch (error) {
      console.error('Erreur chargement secteurs:', error);
      // Données par défaut
      setSecteurs([
        { id: 1, nom: 'Agriculture', description: 'Agriculture et élevage' },
        { id: 2, nom: 'Artisanat', description: 'Artisanat traditionnel' },
        { id: 3, nom: 'Textile', description: 'Textile et vêtements' },
        { id: 4, nom: 'Électronique', description: 'Électronique et technologie' },
        { id: 5, nom: 'Alimentaire', description: 'Produits alimentaires' }
      ]);
    }
  };

  const loadTypesEntreprise = async () => {
    try {
      const response = await apiClient.get('/supplier/types-entreprise');
      setTypesEntreprise((response as any).data?.types || []);
    } catch (error) {
      console.error('Erreur chargement types entreprise:', error);
      // Données par défaut
      setTypesEntreprise([
        { id: 1, nom: 'SARL', description: 'Société à responsabilité limitée' },
        { id: 2, nom: 'SA', description: 'Société anonyme' },
        { id: 3, nom: 'Entreprise individuelle', description: 'Entreprise individuelle' },
        { id: 4, nom: 'Coopérative', description: 'Coopérative' }
      ]);
    }
  };

  const loadCompanyData = async () => {
    try {
      // Essayer d'abord le nouveau endpoint
      let response;
      try {
        response = await apiClient.get('/supplier/company-info');
      } catch (error: any) {
        // Fallback vers l'ancien endpoint si 404
        if (error.message?.includes('404') || error.message?.includes('Route non trouvée')) {
          console.log('⚠️ Fallback vers ancien endpoint...');
          response = await apiClient.get('/supplier/profile');
        } else {
          throw error;
        }
      }
      
      const data = (response as any).data;
      
      if (data && (data.entreprise || data.nom_entreprise)) {
        setHasExistingCompany(true);
        const entrepriseData = data.entreprise || data;
        setCompanyData({
          ...entrepriseData,
          logo: null, // Le fichier ne peut pas être récupéré
          secteur_activite_id: entrepriseData.secteur_activite_id?.toString() || '',
          type_entreprise_id: entrepriseData.type_entreprise_id?.toString() || '',
          annee_creation: entrepriseData.annee_creation?.toString() || '',
          nombre_employes: entrepriseData.nombre_employes?.toString() || ''
        });
      }
    } catch (error: any) {
      console.error('Erreur chargement entreprise:', error);
      if (error.message?.includes('404') || error.message?.includes('Route non trouvée')) {
        // Pas d'entreprise existante, c'est normal
        setHasExistingCompany(false);
      } else {
        toast.error('Erreur lors du chargement des informations de l\'entreprise');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      setCompanyData(prev => ({ ...prev, logo: files[0] }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'nom_entreprise',
      'telephone_professionnel',
      'secteur_activite_id',
      'type_entreprise_id',
      'adresse_ligne1',
      'ville',
      'code_postal',
      'numero_siret'
    ];

    for (const field of requiredFields) {
      if (!companyData[field as keyof CompanyData]) {
        toast.error(`Le champ ${field.replace('_', ' ')} est obligatoire`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Préparer les données pour l'envoi
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs
      Object.entries(companyData).forEach(([key, value]) => {
        if (key === 'logo' && value instanceof File) {
          formDataToSend.append('logo', value);
        } else if (key !== 'logo' && value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      let response;
      try {
        const endpoint = hasExistingCompany 
          ? `/supplier/company-info/${companyData.id}`
          : '/supplier/company-info';
        
        const method = hasExistingCompany ? 'PUT' : 'POST';

        response = await apiClient.request(endpoint, {
          method,
          body: formDataToSend,
          headers: {} // Laisser le navigateur définir le Content-Type pour FormData
        });
      } catch (error: any) {
        // Fallback vers l'ancien endpoint si 404
        if (error.message?.includes('404') || error.message?.includes('Route non trouvée')) {
          console.log('⚠️ Fallback vers ancien endpoint de sauvegarde...');
          
          // Convertir FormData en objet pour l'ancien endpoint
          const dataObject: any = {};
          formDataToSend.forEach((value, key) => {
            if (key !== 'logo') { // Ignorer les fichiers pour l'ancien endpoint
              dataObject[key] = value;
            }
          });
          
          response = await apiClient.put('/supplier/profile', dataObject);
        } else {
          throw error;
        }
      }

      if ((response as any).success) {
        toast.success(hasExistingCompany 
          ? 'Informations de l\'entreprise mises à jour avec succès'
          : 'Informations de l\'entreprise créées avec succès'
        );
        
        // Recharger les données pour refléter les changements
        await loadCompanyData();
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }

    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      const errorMessage = error.message || 'Erreur lors de la sauvegarde';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des informations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Building className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {hasExistingCompany ? 'Modifier les informations' : 'Compléter les informations'} de l'entreprise
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {hasExistingCompany 
                ? 'Mettez à jour les informations de votre entreprise'
                : 'Ajoutez les informations manquantes de votre entreprise'
              }
            </p>
          </div>

          {/* Alerte statut vérification */}
          {hasExistingCompany && companyData.statut_verification && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Statut de vérification: <strong>
                  {companyData.statut_verification === 'en_attente' && 'En attente de vérification'}
                  {companyData.statut_verification === 'verifie' && 'Vérifié ✅'}
                  {companyData.statut_verification === 'rejete' && 'Rejeté ❌'}
                </strong>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise *
                    </label>
                    <Input
                      name="nom_entreprise"
                      required
                      placeholder="Nom de votre entreprise"
                      value={companyData.nom_entreprise}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone professionnel *
                    </label>
                    <Input
                      name="telephone_professionnel"
                      required
                      placeholder="+241 XX XX XX XX"
                      value={companyData.telephone_professionnel}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo de l'entreprise
                  </label>
                  <div className="flex items-center space-x-4">
                    {companyData.logo_url && (
                      <img 
                        src={companyData.logo_url} 
                        alt="Logo actuel" 
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        name="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {companyData.logo_url ? 'Choisir un nouveau logo' : 'Formats acceptés: JPG, PNG, GIF (max 2MB)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <Input
                    name="site_web"
                    placeholder="https://www.votre-site.com"
                    value={companyData.site_web}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secteur d'activité *
                    </label>
                    <SimpleSelect
                      value={companyData.secteur_activite_id}
                      onValueChange={(value) => handleSelectChange('secteur_activite_id', value)}
                      placeholder="Sélectionnez un secteur"
                      options={secteurs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type d'entreprise *
                    </label>
                    <SimpleSelect
                      value={companyData.type_entreprise_id}
                      onValueChange={(value) => handleSelectChange('type_entreprise_id', value)}
                      placeholder="Sélectionnez un type"
                      options={typesEntreprise}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description de l'entreprise
                  </label>
                  <Textarea
                    name="description"
                    placeholder="Décrivez votre entreprise, vos produits et services..."
                    value={companyData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adresse et informations légales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Adresse et informations légales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse ligne 1 *
                  </label>
                  <Input
                    name="adresse_ligne1"
                    required
                    placeholder="Numéro et nom de rue"
                    value={companyData.adresse_ligne1}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse ligne 2
                  </label>
                  <Input
                    name="adresse_ligne2"
                    placeholder="Complément d'adresse (optionnel)"
                    value={companyData.adresse_ligne2}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville *
                    </label>
                    <Input
                      name="ville"
                      required
                      placeholder="Libreville"
                      value={companyData.ville}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal *
                    </label>
                    <Input
                      name="code_postal"
                      required
                      placeholder="BP 1234"
                      value={companyData.code_postal}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <Input
                      name="pays"
                      value={companyData.pays}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro SIRET *
                    </label>
                    <Input
                      name="numero_siret"
                      required
                      placeholder="Numéro d'identification SIRET"
                      value={companyData.numero_siret}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de registre de commerce
                    </label>
                    <Input
                      name="numero_registre_commerce"
                      placeholder="Numéro registre commerce"
                      value={companyData.numero_registre_commerce}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro TVA
                  </label>
                  <Input
                    name="numero_tva"
                    placeholder="Numéro TVA (optionnel)"
                    value={companyData.numero_tva}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informations complémentaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Informations complémentaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Année de création
                    </label>
                    <Input
                      name="annee_creation"
                      type="number"
                      placeholder="2020"
                      value={companyData.annee_creation}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre d'employés
                    </label>
                    <Input
                      name="nombre_employes"
                      type="number"
                      placeholder="10"
                      value={companyData.nombre_employes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité de production
                  </label>
                  <Input
                    name="capacite_production"
                    placeholder="Ex: 1000 unités/mois"
                    value={companyData.capacite_production}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certifications
                  </label>
                  <Textarea
                    name="certifications"
                    placeholder="Listez vos certifications (ISO, etc.)"
                    value={companyData.certifications}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informations bancaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Informations bancaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la banque
                    </label>
                    <Input
                      name="nom_banque"
                      placeholder="Ex: BGFI Bank"
                      value={companyData.nom_banque}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du titulaire du compte
                    </label>
                    <Input
                      name="nom_titulaire_compte"
                      placeholder="Nom sur le compte bancaire"
                      value={companyData.nom_titulaire_compte}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IBAN
                    </label>
                    <Input
                      name="iban"
                      placeholder="GA21 1234 5678 9012 3456 7890 12"
                      value={companyData.iban}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code BIC/SWIFT
                    </label>
                    <Input
                      name="bic_swift"
                      placeholder="BGFIGAXX"
                      value={companyData.bic_swift}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/supplier/dashboard')}
              >
                Annuler
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    {hasExistingCompany ? 'Mettre à jour' : 'Enregistrer'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditCompanyInfo;