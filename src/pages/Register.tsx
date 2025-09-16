import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, Building, Globe, Phone, MapPin, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SimpleSelect } from "@/components/ui/SimpleSelect";
import { useRegister } from "@/hooks/api/useAuth";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Logo from "@/components/ui/Logo";
import RegisterWithVerification from "./RegisterWithVerification";

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

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"acheteur" | "fournisseur">("acheteur");
  const [currentStep, setCurrentStep] = useState(1);
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [typesEntreprise, setTypesEntreprise] = useState<TypeEntreprise[]>([]);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes en secondes



  const [formData, setFormData] = useState({
    // Données utilisateur
    email: '',
    mot_de_passe: '',
    confirm_password: '',
    nom: '',
    prenom: '',
    telephone: '',

    // Données entreprise (pour fournisseurs)
    entreprise: {
      nom_entreprise: '',
      nom_contact: '',
      prenom_contact: '',
      telephone_professionnel: '',
      site_web: '',
      description: '',
      secteur_activite_id: '',
      type_entreprise_id: '',
      annee_creation: '',
      nombre_employes: '',

      // Adresse
      adresse_ligne1: '',
      adresse_ligne2: '',
      ville: '',
      code_postal: '',
      pays: '',

      // Informations légales
      numero_siret: '',
      numero_registre_commerce: '',
      numero_tva: '',
      capacite_production: '',
      certifications: '',


    },

    acceptTerms: false
  });

  const navigate = useNavigate();
  const { register: registerUser } = useRegister();

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl === 'fournisseur' || typeFromUrl === 'acheteur') {
      setUserType(typeFromUrl);
    }
  }, [searchParams]);

  // Charger les données quand le type d'utilisateur change vers fournisseur
  useEffect(() => {
    if (userType === 'fournisseur') {
      loadSecteurs();
      loadTypesEntreprise();
    }
  }, [userType]);

  // Timer pour le code de vérification
  useEffect(() => {
    if (showEmailVerification && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showEmailVerification, timeLeft]);

  const loadSecteurs = async () => {
    try {
      console.log('🔄 Chargement des secteurs...');
      const response = await apiClient.get('/supplier/secteurs');
      console.log('📊 Réponse complète secteurs:', response);
      console.log('📊 Data secteurs:', response.data);

      // Gérer différents formats de réponse
      let secteursList = [];
      if (response.data && response.data.secteurs) {
        secteursList = response.data.secteurs;
      } else if (Array.isArray(response.data)) {
        secteursList = response.data;
      } else if (response.secteurs) {
        secteursList = response.secteurs;
      }

      // Valider que chaque secteur a un id valide
      secteursList = secteursList.filter(secteur => 
        secteur && secteur.id !== null && secteur.id !== undefined && secteur.nom
      );

      console.log('📊 Secteurs traités:', secteursList);
      setSecteurs(secteursList);
    } catch (error) {
      console.error('❌ Erreur chargement secteurs:', error);
      toast.error('Erreur lors du chargement des secteurs d\'activité');
      setSecteurs([]);
    }
  };

  const loadTypesEntreprise = async () => {
    try {
      console.log('🔄 Chargement des types d\'entreprise...');
      const response = await apiClient.get('/supplier/types-entreprise');
      console.log('🏢 Réponse complète types:', response);
      console.log('🏢 Data types:', response.data);

      // Gérer différents formats de réponse
      let typesList = [];
      if (response.data && response.data.types) {
        typesList = response.data.types;
      } else if (Array.isArray(response.data)) {
        typesList = response.data;
      } else if (response.types) {
        typesList = response.types;
      }

      // Valider que chaque type a un id valide
      typesList = typesList.filter(type => 
        type && type.id !== null && type.id !== undefined && type.nom
      );

      console.log('🏢 Types traités:', typesList);
      setTypesEntreprise(typesList);
    } catch (error) {
      console.error('❌ Erreur chargement types entreprise:', error);
      toast.error('Erreur lors du chargement des types d\'entreprise');
      setTypesEntreprise([]);
    }
  };

  // Fonction pour renvoyer le code de vérification
  const handleResendCode = async () => {
    setIsResendingCode(true);
    
    try {
      await apiClient.post('/auth/register/send-verification', {
        email: formData.email
      });
      
      toast.success('Nouveau code envoyé par email !');
      setVerificationCode(''); // Vider le champ
      setTimeLeft(600); // Reset du timer à 10 minutes
    } catch (error: any) {
      console.error('Erreur renvoi code:', error);
      toast.error(error.response?.data?.error || "Erreur lors du renvoi du code");
    } finally {
      setIsResendingCode(false);
    }
  };

  // Rediriger vers RegisterWithVerification pour les acheteurs
  if (userType === 'acheteur') {
    return <RegisterWithVerification />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

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
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
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
    if (userType === 'acheteur') return true; // Pas d'étapes pour les acheteurs

    switch (step) {
      case 1:
        if (!formData.email || !formData.mot_de_passe || !formData.confirm_password) {
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
        const { nom_entreprise, telephone_professionnel, secteur_activite_id, type_entreprise_id } = formData.entreprise;
        if (!nom_entreprise || !telephone_professionnel || !secteur_activite_id || !type_entreprise_id) {
          toast.error('Veuillez remplir tous les champs obligatoires de l\'entreprise');
          return false;
        }
        return true;

      case 3:
        // Étape 3 : Acceptation des conditions
        if (!formData.acceptTerms) {
          toast.error('Vous devez accepter les conditions d\'utilisation');
          return false;
        }
        
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      toast.error("Vous devez accepter les conditions d'utilisation");
      return;
    }

    if (userType === 'acheteur') {
      // Inscription simple pour les acheteurs
      if (formData.mot_de_passe !== formData.confirm_password) {
        toast.error("Les mots de passe ne correspondent pas");
        return;
      }

      if (!formData.email || !formData.mot_de_passe || !formData.nom) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      try {
        const registerData = {
          email: formData.email,
          mot_de_passe: formData.mot_de_passe,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          role_id: 1 // Acheteur
        };

        await registerUser(registerData);
        toast.success("Inscription réussie ! Bienvenue sur GabMarketHub");
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de l'inscription");
      }
      return;
    }

    // Inscription fournisseur avec validation des étapes
    if (!validateStep(currentStep)) {
      return;
    }

    // Debug: Vérifier les données du formulaire avant envoi
    console.log('📝 Données formulaire avant envoi:', formData);
    console.log('🏛️ Données légales formulaire:', {
      numero_siret: formData.entreprise.numero_siret,
      numero_registre_commerce: formData.entreprise.numero_registre_commerce,
      numero_tva: formData.entreprise.numero_tva
    });


    try {
      setIsLoading(true);

      // Préparer les données dans le format attendu par l'API
      const registrationData = {
        // Données utilisateur
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        role_id: 2, // Fournisseur

        // Données entreprise
        entreprise: {
          nom_entreprise: formData.entreprise.nom_entreprise,
          description: formData.entreprise.description,
          site_web: formData.entreprise.site_web,
          telephone_professionnel: formData.entreprise.telephone_professionnel,

          // Adresse
          adresse_ligne1: formData.entreprise.adresse_ligne1,
          adresse_ligne2: formData.entreprise.adresse_ligne2,
          ville: formData.entreprise.ville,
          code_postal: formData.entreprise.code_postal,
          pays: formData.entreprise.pays,

          // Relations (convertir en nombres)
          secteur_activite_id: parseInt(formData.entreprise.secteur_activite_id) || null,
          type_entreprise_id: parseInt(formData.entreprise.type_entreprise_id) || null,

          // Informations légales
          numero_siret: formData.entreprise.numero_siret,
          numero_registre_commerce: formData.entreprise.numero_registre_commerce,
          numero_tva: formData.entreprise.numero_tva,

          // Informations complémentaires
          annee_creation: formData.entreprise.annee_creation ? parseInt(formData.entreprise.annee_creation) : null,
          nombre_employes: formData.entreprise.nombre_employes ? parseInt(formData.entreprise.nombre_employes) : null,
          capacite_production: formData.entreprise.capacite_production,
          certifications: formData.entreprise.certifications,


        }
      };

      console.log('📤 Envoi données inscription fournisseur (formatées):', registrationData);
      console.log('🏛️ Données légales envoyées:', {
        numero_siret: registrationData.entreprise.numero_siret,
        numero_registre_commerce: registrationData.entreprise.numero_registre_commerce,
        numero_tva: registrationData.entreprise.numero_tva
      });

      console.log('📋 Données complètes entreprise:', registrationData.entreprise);

      // Si c'est la première soumission, envoyer le code de vérification
      if (!showEmailVerification) {
        try {
          // Vérifier d'abord si l'email existe déjà
          try {
            await apiClient.get(`/auth/check-email/${encodeURIComponent(registrationData.email)}`);
          } catch (checkError: any) {
            if (checkError.message.includes('Email déjà utilisé')) {
              toast.error('Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.', {
                action: {
                  label: 'Se connecter',
                  onClick: () => navigate('/login')
                }
              });
              return;
            }
          }

          await apiClient.post('/auth/register/send-verification', {
            email: registrationData.email
          });
          
          // Sauvegarder les données du formulaire
          localStorage.setItem('supplierRegistrationData', JSON.stringify(registrationData));
          setShowEmailVerification(true);
          setTimeLeft(600); // Démarrer le timer à 10 minutes
          toast.success('Code de vérification envoyé par email !');
          return;
        } catch (error: any) {
          console.error('Erreur envoi vérification:', error);
          const errorMessage = error.response?.data?.error || "Erreur lors de l'envoi du code de vérification";
          
          if (errorMessage.includes('déjà utilisé et vérifié')) {
            toast.error('Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.', {
              action: {
                label: 'Se connecter',
                onClick: () => navigate('/login')
              }
            });
          } else {
            toast.error(errorMessage);
          }
          return;
        }
      }

      // Si on est en mode vérification, vérifier le code et créer le compte
      if (showEmailVerification) {
        try {
          const savedData = JSON.parse(localStorage.getItem('supplierRegistrationData') || '{}');
          const response = await apiClient.post('/auth/register/verify-code', {
            email: savedData.email,
            verification_code: verificationCode,
            ...savedData
          });

          console.log('✅ Réponse inscription:', response);
          console.log('🔍 Type de response:', typeof response);
          console.log('🔍 Keys de response:', Object.keys(response));
          console.log('🔍 Token présent?', !!response.token);
          console.log('🔍 User présent?', !!response.user);

          if (response.token) {
            localStorage.removeItem('supplierRegistrationData');
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            toast.success('Compte créé avec succès !');
            navigate('/login?message=account_created');
          } else {
            toast.error('Erreur lors de l\'inscription');
          }
        } catch (error: any) {
          console.error('❌ Erreur vérification:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la vérification';
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions de rendu des étapes pour les fournisseurs
  const renderSupplierStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Informations de connexion</h3>
        <p className="text-sm text-gray-600">Créez votre compte fournisseur</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <Input
            name="prenom"
            placeholder="Votre prénom"
            value={formData.prenom}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom *
          </label>
          <Input
            name="nom"
            required
            placeholder="Votre nom"
            value={formData.nom}
            onChange={handleInputChange}
          />
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
          Téléphone
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            name="telephone"
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

  const renderSupplierStep2 = () => (
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

  const renderSupplierStep3 = () => (
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
            Registre de commerce
          </label>
          <Input
            name="entreprise.numero_registre_commerce"
            placeholder="Numéro registre commerce"
            value={formData.entreprise.numero_registre_commerce}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );



  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Logo 
                size="lg" 
                onClick={() => navigate('/')}
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Créer votre compte {userType === 'fournisseur' ? 'Fournisseur' : 'Acheteur'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <a href="/login" className="font-medium text-green-600 hover:text-green-500">
                connectez-vous à votre compte existant
              </a>
            </p>
          </div>

          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={userType === "acheteur" ? "default" : "outline"}
              onClick={() => {
                setUserType("acheteur");
                setCurrentStep(1);
              }}
              className="flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Acheteur
            </Button>
            <Button
              type="button"
              variant={userType === "fournisseur" ? "default" : "outline"}
              onClick={() => {
                setUserType("fournisseur");
                setCurrentStep(1);
                loadSecteurs();
                loadTypesEntreprise();
              }}
              className="flex items-center justify-center gap-2"
            >
              <Building className="w-4 h-4" />
              Fournisseur
            </Button>
          </div>

          {/* Progress bar for suppliers */}
          {userType === 'fournisseur' && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                      }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Compte</span>
                <span>Entreprise</span>
                <span>Adresse</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {userType === 'acheteur' ? (
              // Formulaire simple pour les acheteurs
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <Input
                      name="prenom"
                      placeholder="Votre prénom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <Input
                      name="nom"
                      required
                      placeholder="Votre nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      name="telephone"
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
                      placeholder="Votre mot de passe"
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
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Formulaire par étapes pour les fournisseurs
              <div>
                {currentStep === 1 && renderSupplierStep1()}
                {currentStep === 2 && renderSupplierStep2()}
                {currentStep === 3 && renderSupplierStep3()}

              </div>
            )}

            {/* Code de vérification pour les fournisseurs */}
            {userType === 'fournisseur' && showEmailVerification && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Vérification Email
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Nous avons envoyé un code à 6 chiffres à <strong>{formData.email}</strong>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Entrez le code à 6 chiffres"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest"
                  />
                </div>

                {/* Timer */}
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    Code valide pendant :{' '}
                    <span className="font-mono font-bold text-green-600">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Bouton renvoyer le code */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResendingCode}
                    className="text-sm text-green-600 hover:text-green-500 underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResendingCode ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      'Vous n\'avez pas reçu le code ? Renvoyer'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Terms Acceptance - Only show on last step for suppliers or always for buyers */}
            {(userType === 'fournisseur' && currentStep === 3) || userType === 'acheteur' ? (
              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  J'accepte les{' '}
                  <a href="/terms" className="text-green-600 hover:text-green-500">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="/privacy" className="text-green-600 hover:text-green-500">
                    politique de confidentialité
                  </a>
                </label>
              </div>
            ) : null}

            {/* Navigation Buttons */}
            {userType === 'fournisseur' ? (
              <div className="flex justify-between">
                {(currentStep > 1 || showEmailVerification) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (showEmailVerification) {
                        setShowEmailVerification(false);
                        setVerificationCode('');
                        localStorage.removeItem('supplierRegistrationData');
                      } else {
                        prevStep();
                      }
                    }}
                  >
                    {showEmailVerification ? 'Retour' : 'Précédent'}
                  </Button>
                )}

                <div className="ml-auto">
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {showEmailVerification ? 'Vérification...' : 'Envoi...'}
                        </div>
                      ) : showEmailVerification ? (
                        'Créer le compte'
                      ) : (
                        'Vérifier le mail'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Submit Button for buyers
              <div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création en cours...
                    </div>
                  ) : (
                    'Créer mon compte acheteur'
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Register;