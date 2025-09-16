import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Building, User, Phone, MapPin, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect } from '@/components/ui/SimpleSelect';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
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

const SupplierRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [typesEntreprise, setTypesEntreprise] = useState<TypeEntreprise[]>([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Données utilisateur (pour la table utilisateurs)
    email: '',
    mot_de_passe: '',
    confirm_password: '',
    nom: '', // Nom du fournisseur (personne)
    prenom: '', // Prénom du fournisseur (personne)
    telephone: '', // Téléphone personnel du fournisseur
    role_id: 2, // Rôle fournisseur

    // Données entreprise (pour la table entreprises)
    entreprise: {
      nom_entreprise: '',
      description: '',
      logo: null, // Fichier logo
      site_web: '',
      numero_siret: '',
      numero_registre_commerce: '', // CHAMP MANQUANT
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



      // Champs système (seront gérés par le backend)
      logo_url: '',
      statut_verification: 'en_attente',
      note_moyenne: 0.00,
      nombre_avis: 0,
      date_verification: null
    }
  });

  useEffect(() => {
    loadSecteurs();
    loadTypesEntreprise();
  }, []);

  const loadSecteurs = async () => {
    try {
      const response = await apiClient.get('/supplier/secteurs');
      setSecteurs((response as any).data?.secteurs || []);
    } catch (error) {
      console.error('Erreur chargement secteurs:', error);
      // Données par défaut si l'API n'est pas disponible
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
      // Données par défaut si l'API n'est pas disponible
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

    if (name.startsWith('entreprise.')) {
      const fieldName = name.replace('entreprise.', '');
      setFormData(prev => ({
        ...prev,
        entreprise: {
          ...prev.entreprise,
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith('entreprise.')) {
      const fieldName = name.replace('entreprise.', '');
      setFormData(prev => ({
        ...prev,
        entreprise: {
          ...prev.entreprise,
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        // Validation des informations personnelles du fournisseur
        if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone || !formData.mot_de_passe || !formData.confirm_password) {
          toast.error('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        if (formData.mot_de_passe !== formData.confirm_password) {
          toast.error('Les mots de passe ne correspondent pas');
          return false;
        }
        if (formData.mot_de_passe.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères');
          return false;
        }
        return true;

      case 2:
        // Validation des informations de l'entreprise
        const { nom_entreprise, telephone_professionnel, secteur_activite_id, type_entreprise_id } = formData.entreprise;
        if (!nom_entreprise || !telephone_professionnel || !secteur_activite_id || !type_entreprise_id) {
          toast.error('Veuillez remplir tous les champs obligatoires de l\'entreprise');
          return false;
        }
        return true;

      case 3:
        // Validation de l'adresse et informations légales
        const { adresse_ligne1, ville, code_postal, numero_siret } = formData.entreprise;
        if (!adresse_ligne1 || !ville || !code_postal || !numero_siret) {
          toast.error('Veuillez remplir tous les champs obligatoires d\'adresse et légaux');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ne soumettre que si on est à la dernière étape
    if (currentStep < 4) {
      nextStep();
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setIsLoading(true);

      // Préparer les données pour l'envoi
      const formDataToSend = new FormData();

      // Données utilisateur (pour la table utilisateurs)
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('prenom', formData.prenom);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telephone', formData.telephone);
      formDataToSend.append('mot_de_passe', formData.mot_de_passe);
      formDataToSend.append('role_id', formData.role_id.toString());

      // Données entreprise (pour la table entreprises)
      formDataToSend.append('nom_entreprise', formData.entreprise.nom_entreprise);
      formDataToSend.append('description', formData.entreprise.description);
      formDataToSend.append('site_web', formData.entreprise.site_web);
      formDataToSend.append('numero_siret', formData.entreprise.numero_siret);
      formDataToSend.append('numero_registre_commerce', formData.entreprise.numero_registre_commerce);
      formDataToSend.append('numero_tva', formData.entreprise.numero_tva);
      formDataToSend.append('telephone_professionnel', formData.entreprise.telephone_professionnel);

      // Adresse
      formDataToSend.append('adresse_ligne1', formData.entreprise.adresse_ligne1);
      formDataToSend.append('adresse_ligne2', formData.entreprise.adresse_ligne2);
      formDataToSend.append('ville', formData.entreprise.ville);
      formDataToSend.append('code_postal', formData.entreprise.code_postal);
      formDataToSend.append('pays', formData.entreprise.pays);

      // Relations
      formDataToSend.append('secteur_activite_id', formData.entreprise.secteur_activite_id);
      formDataToSend.append('type_entreprise_id', formData.entreprise.type_entreprise_id);

      // Informations complémentaires
      formDataToSend.append('annee_creation', formData.entreprise.annee_creation);
      formDataToSend.append('nombre_employes', formData.entreprise.nombre_employes);
      formDataToSend.append('capacite_production', formData.entreprise.capacite_production);
      formDataToSend.append('certifications', formData.entreprise.certifications);



      // Logo (fichier)
      if (formData.entreprise.logo) {
        formDataToSend.append('logo', formData.entreprise.logo);
      }

      const response = await apiClient.request('/supplier/register-supplier', {
        method: 'POST',
        body: formDataToSend,
        headers: {} // Laisser le navigateur définir le Content-Type pour FormData
      });

      console.log('Réponse inscription:', response);

      // Vérifier différents formats de réponse
      if (response && (
        (response as any).data?.token || 
        (response as any).token || 
        (response as any).success ||
        (response as any).message?.includes('succès') ||
        (response as any).message?.includes('réussi')
      )) {
        // Inscription réussie
        const token = (response as any).data?.token || (response as any).token;
        const user = (response as any).data?.user || (response as any).user;
        
        if (token) {
          localStorage.setItem('authToken', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        toast.success('Inscription réussie ! Bienvenue sur GabMarketHub');
        navigate('/supplier/login');
      } else {
        // Vérifier si c'est une erreur spécifique
        const errorMsg = (response as any).message || (response as any).error || 'Erreur lors de l\'inscription';
        toast.error(errorMsg);
      }

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
        <p className="text-sm text-gray-600">Vos informations de contact personnel</p>
      </div>

      {/* Informations personnelles du fournisseur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              name="nom"
              type="text"
              required
              placeholder="Votre nom de famille"
              value={formData.nom}
              onChange={handleInputChange}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              name="prenom"
              type="text"
              required
              placeholder="Votre prénom"
              value={formData.prenom}
              onChange={handleInputChange}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email professionnel *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="email"
            type="email"
            required
            placeholder="contact@votre-entreprise.com"
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone personnel *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="telephone"
            type="tel"
            required
            placeholder="+241 XX XX XX XX"
            value={formData.telephone}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="mot_de_passe"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Minimum 6 caractères"
            value={formData.mot_de_passe}
            onChange={handleInputChange}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmer le mot de passe *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="confirm_password"
            type="password"
            required
            placeholder="Confirmez votre mot de passe"
            value={formData.confirm_password}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name.startsWith('entreprise.')) {
        const fieldName = name.replace('entreprise.', '');
        setFormData(prev => ({
          ...prev,
          entreprise: {
            ...prev.entreprise,
            [fieldName]: files[0]
          }
        }));
      }
    }
  };

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Informations de l'entreprise</h3>
        <p className="text-sm text-gray-600">Présentez votre entreprise</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de l'entreprise *
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="entreprise.nom_entreprise"
            required
            placeholder="Nom de votre entreprise"
            value={formData.entreprise.nom_entreprise}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo de l'entreprise
        </label>
        <Input
          name="entreprise.logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPG, PNG, GIF (max 2MB)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone professionnel *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="entreprise.telephone_professionnel"
            required
            placeholder="+241 XX XX XX XX"
            value={formData.entreprise.telephone_professionnel}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site web
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="entreprise.site_web"
            placeholder="https://www.votre-site.com"
            value={formData.entreprise.site_web}
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
            value={formData.entreprise.secteur_activite_id}
            onValueChange={(value) => handleSelectChange('entreprise.secteur_activite_id', value)}
            placeholder="Sélectionnez un secteur"
            options={secteurs}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d'entreprise *
          </label>
          <SimpleSelect
            value={formData.entreprise.type_entreprise_id}
            onValueChange={(value) => handleSelectChange('entreprise.type_entreprise_id', value)}
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
          name="entreprise.description"
          placeholder="Décrivez votre entreprise, vos produits et services..."
          value={formData.entreprise.description}
          onChange={handleInputChange}
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Adresse et informations légales</h3>
        <p className="text-sm text-gray-600">Informations de localisation et légales</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse ligne 1 *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="entreprise.adresse_ligne1"
            required
            placeholder="Numéro et nom de rue"
            value={formData.entreprise.adresse_ligne1}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse ligne 2
        </label>
        <Input
          name="entreprise.adresse_ligne2"
          placeholder="Complément d'adresse (optionnel)"
          value={formData.entreprise.adresse_ligne2}
          onChange={handleInputChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville *
          </label>
          <Input
            name="entreprise.ville"
            required
            placeholder="Libreville"
            value={formData.entreprise.ville}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code postal *
          </label>
          <Input
            name="entreprise.code_postal"
            required
            placeholder="BP 1234"
            value={formData.entreprise.code_postal}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pays *
          </label>
          <select
            name="entreprise.pays"
            value={formData.entreprise.pays}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionnez votre pays</option>
            <option value="Gabon">Gabon</option>
            <option value="Italie">Italie</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro SIRET *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              name="entreprise.numero_siret"
              required
              placeholder="Numéro d'identification SIRET"
              value={formData.entreprise.numero_siret}
              onChange={handleInputChange}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de registre de commerce
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              name="entreprise.numero_registre_commerce"
              placeholder="Numéro registre commerce"
              value={formData.entreprise.numero_registre_commerce}
              onChange={handleInputChange}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro TVA
        </label>
        <Input
          name="entreprise.numero_tva"
          placeholder="Numéro TVA (optionnel)"
          value={formData.entreprise.numero_tva}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Informations complémentaires</h3>
        <p className="text-sm text-gray-600">Détails sur votre entreprise</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Année de création
          </label>
          <Input
            name="entreprise.annee_creation"
            type="number"
            placeholder="2020"
            value={formData.entreprise.annee_creation}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre d'employés
          </label>
          <Input
            name="entreprise.nombre_employes"
            type="number"
            placeholder="10"
            value={formData.entreprise.nombre_employes}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacité de production
        </label>
        <Input
          name="entreprise.capacite_production"
          placeholder="Ex: 1000 unités/mois"
          value={formData.entreprise.capacite_production}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certifications
        </label>
        <Textarea
          name="entreprise.certifications"
          placeholder="Listez vos certifications (ISO, etc.)"
          value={formData.entreprise.certifications}
          onChange={handleInputChange}
          rows={3}
        />
      </div>
    </div>
  );



  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Building className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Inscription Fournisseur
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Rejoignez GabMarketHub et développez votre business
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                    }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 mx-1 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Compte</span>
              <span>Entreprise</span>
              <span>Adresse</span>
              <span>Finalisation</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <div className="flex justify-between mt-8">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      Précédent
                    </Button>
                  )}

                  <div className="ml-auto">
                    {currentStep < 4 ? (
                      <Button
                        type="submit"
                      >
                        Suivant
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? 'Inscription...' : 'Créer mon compte'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/supplier/login" className="font-medium text-green-600 hover:text-green-500">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupplierRegister;