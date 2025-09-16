import { useState, useEffect } from 'react';
import { Building, Globe, MapPin, FileText, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/SimpleSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiClient } from '@/services/api';
import { useUpdateEntreprise } from '@/hooks/api/useEntreprise';

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

interface CompanyInfoFormProps {
  initialData: any;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyInfoForm = ({ initialData, onSave, onCancel }: CompanyInfoFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [typesEntreprise, setTypesEntreprise] = useState<TypeEntreprise[]>([]);
  const [hasExistingCompany, setHasExistingCompany] = useState(false);
  const updateEntrepriseMutation = useUpdateEntreprise();

  const [companyData, setCompanyData] = useState<CompanyData>({
    id: initialData?.id,
    nom_entreprise: initialData?.nom_entreprise || '',
    description: initialData?.description || '',
    logo: null,
    logo_url: initialData?.logo_url || '',
    site_web: initialData?.site_web || '',
    numero_siret: initialData?.numero_siret || '',
    numero_registre_commerce: initialData?.numero_registre_commerce || '',
    numero_tva: initialData?.numero_tva || '',
    telephone_professionnel: initialData?.telephone_professionnel || '',
    
    // Adresse
    adresse_ligne1: initialData?.adresse_ligne1 || '',
    adresse_ligne2: initialData?.adresse_ligne2 || '',
    ville: initialData?.ville || '',
    code_postal: initialData?.code_postal || '',
    pays: initialData?.pays || 'Gabon',
    
    // Relations
    secteur_activite_id: initialData?.secteur_activite_id?.toString() || '',
    type_entreprise_id: initialData?.type_entreprise_id?.toString() || '',
    
    // Informations complémentaires
    annee_creation: initialData?.annee_creation?.toString() || '',
    nombre_employes: initialData?.nombre_employes?.toString() || '',
    capacite_production: initialData?.capacite_production || '',
    certifications: initialData?.certifications || '',
    
    // Informations bancaires
    nom_banque: initialData?.nom_banque || '',
    iban: initialData?.iban || '',
    nom_titulaire_compte: initialData?.nom_titulaire_compte || '',
    bic_swift: initialData?.bic_swift || '',
    
    // Statut
    statut_verification: initialData?.statut_verification || 'en_attente'
  });

  useEffect(() => {
    console.log('🔄 Initialisation CompanyInfoForm avec:', initialData);
    loadReferenceData();
    setHasExistingCompany(!!initialData?.id);
    
    // Mettre à jour les données du formulaire quand initialData change
    if (initialData) {
      setCompanyData(prev => ({
        ...prev,
        id: initialData.id,
        nom_entreprise: initialData.nom_entreprise || '',
        description: initialData.description || '',
        logo_url: initialData.logo_url || '',
        site_web: initialData.site_web || '',
        numero_siret: initialData.numero_siret || '',
        numero_registre_commerce: initialData.numero_registre_commerce || '',
        numero_tva: initialData.numero_tva || '',
        telephone_professionnel: initialData.telephone_professionnel || '',
        adresse_ligne1: initialData.adresse_ligne1 || '',
        adresse_ligne2: initialData.adresse_ligne2 || '',
        ville: initialData.ville || '',
        code_postal: initialData.code_postal || '',
        pays: initialData.pays || 'Gabon',
        secteur_activite_id: initialData.secteur_activite_id?.toString() || '',
        type_entreprise_id: initialData.type_entreprise_id?.toString() || '',
        annee_creation: initialData.annee_creation?.toString() || '',
        nombre_employes: initialData.nombre_employes?.toString() || '',
        capacite_production: initialData.capacite_production || '',
        certifications: initialData.certifications || '',
        nom_banque: initialData.nom_banque || '',
        iban: initialData.iban || '',
        nom_titulaire_compte: initialData.nom_titulaire_compte || '',
        bic_swift: initialData.bic_swift || '',
        statut_verification: initialData.statut_verification || 'en_attente'
      }));
    }
  }, [initialData]);

  const loadReferenceData = async () => {
    try {
      await Promise.all([loadSecteurs(), loadTypesEntreprise()]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const loadSecteurs = async () => {
    try {
      console.log('🔄 Chargement des secteurs...');
      const response = await apiClient.get('/supplier/secteurs');
      console.log('✅ Secteurs chargés:', response);
      // Essayer différentes structures de données
      const secteurs = (response as any).secteurs || (response as any).data?.secteurs || [];
      console.log('📋 Secteurs extraits:', secteurs);
      setSecteurs(secteurs);
    } catch (error) {
      console.log('❌ Erreur chargement secteurs, utilisation des données par défaut:', error);
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
      console.log('🔄 Chargement des types d\'entreprise...');
      const response = await apiClient.get('/supplier/types-entreprise');
      console.log('✅ Types d\'entreprise chargés:', response);
      // Essayer différentes structures de données
      const types = (response as any).types || (response as any).data?.types || [];
      console.log('📋 Types extraits:', types);
      setTypesEntreprise(types);
    } catch (error) {
      console.log('❌ Erreur chargement types entreprise, utilisation des données par défaut:', error);
      setTypesEntreprise([
        { id: 1, nom: 'SARL', description: 'Société à responsabilité limitée' },
        { id: 2, nom: 'SA', description: 'Société anonyme' },
        { id: 3, nom: 'Entreprise individuelle', description: 'Entreprise individuelle' },
        { id: 4, nom: 'Coopérative', description: 'Coopérative' }
      ]);
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

      // Préparer les données pour l'envoi (sans les fichiers pour l'instant)
      const dataToSend = {
        nom_entreprise: companyData.nom_entreprise,
        description: companyData.description,
        site_web: companyData.site_web,
        numero_siret: companyData.numero_siret,
        numero_registre_commerce: companyData.numero_registre_commerce,
        numero_tva: companyData.numero_tva,
        telephone_professionnel: companyData.telephone_professionnel,
        adresse_ligne1: companyData.adresse_ligne1,
        adresse_ligne2: companyData.adresse_ligne2,
        ville: companyData.ville,
        code_postal: companyData.code_postal,
        pays: companyData.pays,
        secteur_activite_id: parseInt(companyData.secteur_activite_id) || null,
        type_entreprise_id: parseInt(companyData.type_entreprise_id) || null,
        annee_creation: parseInt(companyData.annee_creation) || null,
        nombre_employes: parseInt(companyData.nombre_employes) || null,
        capacite_production: companyData.capacite_production,
        certifications: companyData.certifications,
        nom_banque: companyData.nom_banque,
        iban: companyData.iban,
        nom_titulaire_compte: companyData.nom_titulaire_compte,
        bic_swift: companyData.bic_swift
      };

      console.log('💾 Sauvegarde avec les données:', dataToSend);
      console.log('🆔 ID entreprise:', companyData.id);

      await updateEntrepriseMutation.mutateAsync({
        id: companyData.id!,
        data: dataToSend
      });

      toast.success('Informations de l\'entreprise mises à jour avec succès');
      onSave();

    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      const errorMessage = error.message || 'Erreur lors de la sauvegarde';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              Site web
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                name="site_web"
                placeholder="https://www.votre-site.com"
                value={companyData.site_web}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
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
              Description de l'entreprise
            </label>
            <Textarea
              name="description"
              placeholder="Décrivez votre entreprise, vos produits et services..."
              value={companyData.description}
              onChange={handleInputChange}
              rows={3}
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
        <CardContent className="space-y-4">
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
                Numéro TVA
              </label>
              <Input
                name="numero_tva"
                placeholder="Numéro TVA (optionnel)"
                value={companyData.numero_tva}
                onChange={handleInputChange}
              />
            </div>
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
        <CardContent className="space-y-4">
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
        <CardContent className="space-y-4">
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
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
  );
};