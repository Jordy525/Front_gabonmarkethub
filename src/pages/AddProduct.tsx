import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleSelect } from "@/components/ui/SimpleSelect";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Upload, Package, DollarSign, Truck, FileText, Shield } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import SupplierLayout from "@/components/layout/SupplierLayout";
import SupplierProfileCheck from "@/components/SupplierProfileCheck";

interface PrixDegressif {
  quantite_min: number;
  quantite_max: number | null;
  prix_unitaire: number;
  devise: string;
}

interface Variante {
  nom_variante: string;
  valeur_variante: string;
  prix_supplement: number;
  stock_variante: number;
  sku: string;
}

interface Specification {
  nom: string;
  valeur: string;
  unite: string;
}

interface MethodeLivraison {
  methode: string;
  cout_estime: number;
  delai_min: number;
  delai_max: number;
  description: string;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // Options statiques pour les Select
  const uniteOptions = [
    { id: "pièce", nom: "Pièce" },
    { id: "kg", nom: "Kilogramme" },
    { id: "m", nom: "Mètre" },
    { id: "m²", nom: "Mètre carré" },
    { id: "litre", nom: "Litre" }
  ];

  const methodeLivraisonOptions = [
    { id: "DHL", nom: "DHL" },
    { id: "FedEx", nom: "FedEx" },
    { id: "UPS", nom: "UPS" },
    { id: "Bateau", nom: "Bateau" },
    { id: "Avion", nom: "Avion" }
  ];


  const [images, setImages] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // États pour les données du produit
  const [formData, setFormData] = useState({
    // Informations générales
    nom: "",
    marque: "",
    reference_produit: "",
    categorie_id: "",
    description: "",
    description_longue: "",
    fonctionnalites: "",
    instructions_utilisation: "",
    
    // Caractéristiques techniques
    materiaux: "",
    poids: "",
    dimensions: "",
    couleurs_disponibles: [] as string[],
    
    // Prix et options d'achat
    prix_unitaire: "",
    moq: "1",
    stock_disponible: "",
    unite: "pièce",
    capacite_approvisionnement: "",
    
    // Expédition et livraison
    delai_traitement: "7",
    port_depart: "",
    delai_livraison_estime: "",
    
    // Conditions commerciales
    conditions_paiement: [] as string[],
    politique_retour: "",
    garantie: "",
    
    // Média
    video_url: "",
    
    // Certifications
    certifications: [] as string[]
  });

  const [prixDegressifs, setPrixDegressifs] = useState<PrixDegressif[]>([]);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [methodesLivraison, setMethodesLivraison] = useState<MethodeLivraison[]>([]);

  // Récupérer les catégories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories')
  });
  
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || [];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length > 10) {
        toast.error("Maximum 10 images autorisées");
        return;
      }
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Ajouter une erreur si plus d'images
    if (newImages.length === 0) {
      setValidationErrors(prev => ({ ...prev, images: true }));
    }
  };

  const addPrixDegressif = () => {
    setPrixDegressifs(prev => [...prev, {
      quantite_min: 1,
      quantite_max: null,
      prix_unitaire: 0,
      devise: "EUR"
    }]);
  };

  const addVariante = () => {
    setVariantes(prev => [...prev, {
      nom_variante: "",
      valeur_variante: "",
      prix_supplement: 0,
      stock_variante: 0,
      sku: ""
    }]);
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, {
      nom: "",
      valeur: "",
      unite: ""
    }]);
  };

  const addMethodeLivraison = () => {
    setMethodesLivraison(prev => [...prev, {
      methode: "",
      cout_estime: 0,
      delai_min: 1,
      delai_max: 7,
      description: ""
    }]);
  };

  // Fonction pour vérifier les erreurs par onglet
  const getTabErrors = () => {
    const tabErrors = {
      general: validationErrors.nom || validationErrors.categorie_id || validationErrors.description_longue,
      images: validationErrors.images,
      prix: validationErrors.prix_unitaire || validationErrors.moq,
      livraison: false,
      conditions: false,
      certifications: false
    };
    return tabErrors;
  };

  // Fonction de validation
  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    
    // Champs obligatoires
    const requiredFields = {
      nom: 'Nom du produit',
      categorie_id: 'Catégorie',
      description_longue: 'Description détaillée',
      prix_unitaire: 'Prix unitaire',
      moq: 'Quantité minimum (MOQ)'
    };

    // Vérifier les champs obligatoires
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData] === '') {
        errors[field] = true;
      }
    });

    // Vérifier qu'au moins une image est uploadée
    if (images.length === 0) {
      errors['images'] = true;
    }

    // Validation des champs numériques
    if (formData.prix_unitaire && isNaN(parseFloat(formData.prix_unitaire))) {
      errors['prix_unitaire'] = true;
    }
    
    if (formData.moq && isNaN(parseInt(formData.moq))) {
      errors['moq'] = true;
    }

    setValidationErrors(errors);
    
    // Afficher les erreurs spécifiques
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const missingFields = errorFields.map(field => {
        if (field === 'images') return 'Au moins une image';
        return requiredFields[field as keyof typeof requiredFields] || field;
      }).join(', ');
      
      toast.error(`Veuillez remplir les champs obligatoires: ${missingFields}`, {
        duration: 6000,
        description: "Les champs avec des bordures rouges doivent être complétés."
      });
      
      // Faire défiler vers le premier champ avec erreur
      const firstErrorField = errorFields[0];
      const element = document.getElementById(firstErrorField) || document.querySelector(`[data-field="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire avant soumission
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Retour à FormData maintenant que le backend supporte multer
      const formDataToSend = new FormData();
      
      // Préparer et nettoyer les données avant envoi
      const cleanedData = { ...formData };
      
      // Convertir les champs numériques avec valeurs par défaut
      const numericFields = {
        'prix_unitaire': { type: 'float', required: true },
        'moq': { type: 'int', required: true, default: 1 },
        'stock_disponible': { type: 'int', required: false, default: 0 },
        'capacite_approvisionnement': { type: 'int', required: false },
        'delai_traitement': { type: 'int', required: false, default: 7 },
        'poids': { type: 'float', required: false }
      };
      
      Object.entries(numericFields).forEach(([field, config]) => {
        const value = cleanedData[field as keyof typeof cleanedData] as string;
        
        if (value && value !== '') {
          const numValue = config.type === 'int' ? parseInt(value) : parseFloat(value);
          if (!isNaN(numValue)) {
            cleanedData[field as keyof typeof cleanedData] = numValue.toString();
          } else if (config.required && config.default !== undefined) {
            cleanedData[field as keyof typeof cleanedData] = config.default.toString();
          }
        } else if (config.required && config.default !== undefined) {
          cleanedData[field as keyof typeof cleanedData] = config.default.toString();
        }
      });

      // Validation spéciale pour categorie_id
      if (!cleanedData.categorie_id || cleanedData.categorie_id === '' || cleanedData.categorie_id === '0') {
        throw new Error('Catégorie obligatoire non sélectionnée');
      }
      
      // Vérifier que categorie_id est un nombre valide
      const categorieIdNum = parseInt(cleanedData.categorie_id);
      if (isNaN(categorieIdNum) || categorieIdNum <= 0) {
        throw new Error('Catégorie invalide sélectionnée');
      }

      // Traitement spécial des champs JSON (comme le backend les attend)
      const jsonFields = ['couleurs_disponibles', 'certifications', 'conditions_paiement'];
      
      // Ajouter les données du produit à FormData
      Object.entries(cleanedData).forEach(([key, value]) => {
        if (jsonFields.includes(key)) {
          // Champs JSON : envoyer seulement s'ils ont du contenu
          if (Array.isArray(value) && value.length > 0) {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (typeof value === 'string' && value.trim() !== '') {
            formDataToSend.append(key, value);
          }
          // Si vide, ne pas envoyer (le backend mettra null)
        } else if (Array.isArray(value)) {
          // Autres arrays (ne devrait pas y en avoir)
          if (value.length > 0) {
            formDataToSend.append(key, JSON.stringify(value));
          }
        } else if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Ajouter les images maintenant que le backend les supporte
      console.log('🔍 DEBUG FRONTEND - Images avant ajout à FormData:', {
        count: images.length,
        images: images.map(img => ({ name: img.name, size: img.size, type: img.type }))
      });
      
      images.forEach((image, index) => {
        console.log(`Ajout image ${index + 1}:`, { name: image.name, size: image.size });
        formDataToSend.append('images', image);
      });
      
      console.log('FormData après ajout images - has images:', formDataToSend.has('images'));

      // Ajouter les données complexes
      if (prixDegressifs.length > 0) {
        formDataToSend.append('prix_degressifs', JSON.stringify(prixDegressifs));
      }
      if (variantes.length > 0) {
        formDataToSend.append('variantes', JSON.stringify(variantes));
      }
      if (specifications.length > 0) {
        formDataToSend.append('specifications', JSON.stringify(specifications));
      }
      if (methodesLivraison.length > 0) {
        formDataToSend.append('methodes_livraison', JSON.stringify(methodesLivraison));
      }

      // Debug: Afficher les données envoyées AVANT l'envoi
      console.log('=== DEBUG FORM SUBMISSION (FORMDATA + IMAGES) ===');
      console.log('Données nettoyées:', cleanedData);
      console.log('FormData entries:', Object.fromEntries(formDataToSend.entries()));
      console.log('Images à envoyer:', images.map(img => ({ name: img.name, size: img.size, type: img.type })));
      console.log('Champs obligatoires backend:', {
        nom: cleanedData.nom,
        prix_unitaire: cleanedData.prix_unitaire,
        categorie_id: cleanedData.categorie_id,
        description_longue: cleanedData.description_longue
      });
      console.log('===============================');

      // ✅ ENVOYER EN FORMDATA avec images (backend supporte maintenant multer)
      const response = await apiClient.request('/products', {
        method: 'POST',
        body: formDataToSend
      });

      toast.success("Produit créé avec succès !");
      navigate('/supplier/dashboard');

    } catch (error: any) {
      console.error('Erreur création produit:', error);
      
      // Gestion spécifique des erreurs
      if (error.message?.includes('Session expirée')) {
        toast.error('Session expirée, vous allez être redirigé vers la connexion');
      } else if (error.message?.includes('Accès refusé')) {
        toast.error('Accès refusé. Vérifiez que votre profil entreprise est complet.');
      } else if (error.message?.includes('Profil entreprise non trouvé')) {
        toast.error('Profil entreprise non trouvé. Veuillez compléter votre inscription.');
        navigate('/supplier/profile');
      } else if (error.message?.includes('HTTP error! status: 400')) {
        toast.error('Données invalides. Vérifiez que tous les champs obligatoires sont correctement remplis.', {
          description: 'Erreur 400: ' + error.message
        });
      } else {
        toast.error(error.message || "Erreur lors de la création du produit");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SupplierLayout>
      <SupplierProfileCheck>
        <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gabon-gray">Ajouter un nouveau produit</h1>
          <p className="text-gray-600 mt-2">Remplissez toutes les informations pour créer votre produit</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Champs obligatoires (*):</strong> Nom du produit, Catégorie, Description détaillée, Prix unitaire, MOQ et au moins une image.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200">
              <TabsTrigger value="general" className={`flex items-center gap-2 data-[state=active]:bg-gabon-green data-[state=active]:text-white ${getTabErrors().general ? 'border-red-500 text-red-600' : ''}`}>
                <Package className="w-4 h-4" />
                Général
                {getTabErrors().general && <span className="text-red-500">●</span>}
              </TabsTrigger>
              <TabsTrigger value="images" className={`flex items-center gap-2 data-[state=active]:bg-gabon-green data-[state=active]:text-white ${getTabErrors().images ? 'border-red-500 text-red-600' : ''}`}>
                <Upload className="w-4 h-4" />
                Images
                {getTabErrors().images && <span className="text-red-500">●</span>}
              </TabsTrigger>
              <TabsTrigger value="prix" className={`flex items-center gap-2 data-[state=active]:bg-gabon-green data-[state=active]:text-white ${getTabErrors().prix ? 'border-red-500 text-red-600' : ''}`}>
                <DollarSign className="w-4 h-4" />
                Prix
                {getTabErrors().prix && <span className="text-red-500">●</span>}
              </TabsTrigger>
              <TabsTrigger value="livraison" className="flex items-center gap-2 data-[state=active]:bg-gabon-green data-[state=active]:text-white">
                <Truck className="w-4 h-4" />
                Livraison
              </TabsTrigger>
              <TabsTrigger value="conditions" className="flex items-center gap-2 data-[state=active]:bg-gabon-green data-[state=active]:text-white">
                <FileText className="w-4 h-4" />
                Conditions
              </TabsTrigger>
              <TabsTrigger value="certifications" className="flex items-center gap-2 data-[state=active]:bg-gabon-green data-[state=active]:text-white">
                <Shield className="w-4 h-4" />
                Certifications
              </TabsTrigger>
            </TabsList>

            {/* Onglet Informations générales */}
            <TabsContent value="general">
              <Card>
                <CardHeader className="bg-gradient-to-r from-gabon-green to-gabon-blue">
                  <CardTitle className="text-white">Informations générales du produit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nom">Nom du produit *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => {
                          handleInputChange('nom', e.target.value);
                          // Supprimer l'erreur si le champ est rempli
                          if (validationErrors.nom && e.target.value.trim()) {
                            setValidationErrors(prev => ({ ...prev, nom: false }));
                          }
                        }}
                        placeholder="Ex: T-shirt en coton bio pour homme"
                        className={validationErrors.nom ? 'border-red-500 focus:border-red-500' : ''}
                        required
                      />
                      {validationErrors.nom && (
                        <p className="text-red-500 text-sm mt-1">Ce champ est obligatoire</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="marque">Marque</Label>
                      <Input
                        id="marque"
                        value={formData.marque}
                        onChange={(e) => handleInputChange('marque', e.target.value)}
                        placeholder="Nom de la marque"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference_produit">Référence produit</Label>
                      <Input
                        id="reference_produit"
                        value={formData.reference_produit}
                        onChange={(e) => handleInputChange('reference_produit', e.target.value)}
                        placeholder="REF-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categorie_id">Catégorie *</Label>
                      <SimpleSelect
                        value={formData.categorie_id}
                        onValueChange={(value) => {
                          handleInputChange('categorie_id', value);
                          // Supprimer l'erreur si une catégorie est sélectionnée
                          if (validationErrors.categorie_id && value) {
                            setValidationErrors(prev => ({ ...prev, categorie_id: false }));
                          }
                        }}
                        placeholder="Sélectionner une catégorie"
                        options={categories}
                        className={validationErrors.categorie_id ? 'border-red-500' : ''}
                      />
                      {validationErrors.categorie_id && (
                        <p className="text-red-500 text-sm mt-1">Ce champ est obligatoire</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description courte</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Description courte du produit"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description_longue">Description détaillée *</Label>
                    <Textarea
                      id="description_longue"
                      value={formData.description_longue}
                      onChange={(e) => {
                        handleInputChange('description_longue', e.target.value);
                        // Supprimer l'erreur si le champ est rempli
                        if (validationErrors.description_longue && e.target.value.trim()) {
                          setValidationErrors(prev => ({ ...prev, description_longue: false }));
                        }
                      }}
                      placeholder="Description complète avec matières, usages, caractéristiques techniques, avantages..."
                      rows={6}
                      className={validationErrors.description_longue ? 'border-red-500 focus:border-red-500' : ''}
                      required
                    />
                    {validationErrors.description_longue && (
                      <p className="text-red-500 text-sm mt-1">Ce champ est obligatoire</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fonctionnalites">Fonctionnalités principales</Label>
                    <Textarea
                      id="fonctionnalites"
                      value={formData.fonctionnalites}
                      onChange={(e) => handleInputChange('fonctionnalites', e.target.value)}
                      placeholder="• Fonctionnalité 1&#10;• Fonctionnalité 2&#10;• Fonctionnalité 3"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions_utilisation">Instructions d'utilisation</Label>
                    <Textarea
                      id="instructions_utilisation"
                      value={formData.instructions_utilisation}
                      onChange={(e) => handleInputChange('instructions_utilisation', e.target.value)}
                      placeholder="Instructions d'utilisation du produit"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="materiaux">Matériaux/Composants</Label>
                      <Input
                        id="materiaux"
                        value={formData.materiaux}
                        onChange={(e) => handleInputChange('materiaux', e.target.value)}
                        placeholder="Ex: 100% Coton bio"
                      />
                    </div>
                    <div>
                      <Label htmlFor="poids">Poids (kg)</Label>
                      <Input
                        id="poids"
                        type="number"
                        step="0.01"
                        value={formData.poids}
                        onChange={(e) => handleInputChange('poids', e.target.value)}
                        placeholder="0.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => handleInputChange('dimensions', e.target.value)}
                        placeholder="L x l x h (cm)"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Couleurs disponibles</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.couleurs_disponibles.map((couleur, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {couleur}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-red-100"
                            onClick={() => {
                              handleInputChange('couleurs_disponibles', 
                                formData.couleurs_disponibles.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Ajouter une couleur"
                          className="w-40"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const couleur = input.value.trim();
                              if (couleur && !formData.couleurs_disponibles.includes(couleur)) {
                                handleInputChange('couleurs_disponibles', [...formData.couleurs_disponibles, couleur]);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                            const couleur = input?.value.trim();
                            if (couleur && !formData.couleurs_disponibles.includes(couleur)) {
                              handleInputChange('couleurs_disponibles', [...formData.couleurs_disponibles, couleur]);
                              input.value = '';
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Images */}
            <TabsContent value="images">
              <Card>
                <CardHeader className="bg-gradient-to-r from-gabon-green to-gabon-blue">
                  <CardTitle className="text-white">Images et vidéos du produit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="images">Images du produit * (3-10 images recommandées)</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        handleImageUpload(e);
                        // Supprimer l'erreur si des images sont ajoutées
                        if (validationErrors.images && e.target.files && e.target.files.length > 0) {
                          setValidationErrors(prev => ({ ...prev, images: false }));
                        }
                      }}
                      className={`mt-2 ${validationErrors.images ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Formats acceptés: JPG, PNG, WebP. Taille max: 5MB par image.
                    </p>
                    {validationErrors.images && (
                      <p className="text-red-500 text-sm mt-1">Au moins une image est obligatoire</p>
                    )}
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2 text-xs">
                              Image principale
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Prix */}
            <TabsContent value="prix">
              <Card>
                <CardHeader className="bg-gradient-to-r from-gabon-green to-gabon-blue">
                  <CardTitle className="text-white">Prix et options d'achat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="prix_unitaire">Prix unitaire (€) *</Label>
                      <Input
                        id="prix_unitaire"
                        type="number"
                        step="0.01"
                        value={formData.prix_unitaire}
                        onChange={(e) => {
                          handleInputChange('prix_unitaire', e.target.value);
                          // Supprimer l'erreur si le champ est rempli
                          if (validationErrors.prix_unitaire && e.target.value.trim()) {
                            setValidationErrors(prev => ({ ...prev, prix_unitaire: false }));
                          }
                        }}
                        placeholder="10.00"
                        className={validationErrors.prix_unitaire ? 'border-red-500 focus:border-red-500' : ''}
                        required
                      />
                      {validationErrors.prix_unitaire && (
                        <p className="text-red-500 text-sm mt-1">Ce champ est obligatoire</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="moq">MOQ (Quantité minimum) *</Label>
                      <Input
                        id="moq"
                        type="number"
                        value={formData.moq}
                        onChange={(e) => {
                          handleInputChange('moq', e.target.value);
                          // Supprimer l'erreur si le champ est rempli
                          if (validationErrors.moq && e.target.value.trim()) {
                            setValidationErrors(prev => ({ ...prev, moq: false }));
                          }
                        }}
                        placeholder="1"
                        className={validationErrors.moq ? 'border-red-500 focus:border-red-500' : ''}
                        required
                      />
                      {validationErrors.moq && (
                        <p className="text-red-500 text-sm mt-1">Ce champ est obligatoire</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="stock_disponible">Stock disponible</Label>
                      <Input
                        id="stock_disponible"
                        type="number"
                        value={formData.stock_disponible}
                        onChange={(e) => handleInputChange('stock_disponible', e.target.value)}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unite">Unité</Label>
                      <SimpleSelect
                        value={formData.unite}
                        onValueChange={(value) => handleInputChange('unite', value)}
                        placeholder="Sélectionner une unité"
                        options={uniteOptions}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="capacite_approvisionnement">Capacité d'approvisionnement (unités/mois)</Label>
                    <Input
                      id="capacite_approvisionnement"
                      type="number"
                      value={formData.capacite_approvisionnement}
                      onChange={(e) => handleInputChange('capacite_approvisionnement', e.target.value)}
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Prix dégressifs</Label>
                      <Button type="button" onClick={addPrixDegressif} size="sm" className="bg-gabon-yellow text-gabon-gray hover:bg-gabon-yellow/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un palier
                      </Button>
                    </div>
                    {prixDegressifs.map((prix, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Quantité min</Label>
                          <Input
                            type="number"
                            value={prix.quantite_min}
                            onChange={(e) => {
                              const newPrix = [...prixDegressifs];
                              newPrix[index].quantite_min = parseInt(e.target.value);
                              setPrixDegressifs(newPrix);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Quantité max</Label>
                          <Input
                            type="number"
                            value={prix.quantite_max || ''}
                            onChange={(e) => {
                              const newPrix = [...prixDegressifs];
                              newPrix[index].quantite_max = e.target.value ? parseInt(e.target.value) : null;
                              setPrixDegressifs(newPrix);
                            }}
                            placeholder="Illimité"
                          />
                        </div>
                        <div>
                          <Label>Prix unitaire</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={prix.prix_unitaire}
                            onChange={(e) => {
                              const newPrix = [...prixDegressifs];
                              newPrix[index].prix_unitaire = parseFloat(e.target.value);
                              setPrixDegressifs(newPrix);
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setPrixDegressifs(prev => prev.filter((_, i) => i !== index))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Livraison */}
            <TabsContent value="livraison">
              <Card>
                <CardHeader className="bg-gradient-to-r from-gabon-green to-gabon-blue">
                  <CardTitle className="text-white">Expédition et livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="delai_traitement">Délai de traitement (jours)</Label>
                      <Input
                        id="delai_traitement"
                        type="number"
                        value={formData.delai_traitement}
                        onChange={(e) => handleInputChange('delai_traitement', e.target.value)}
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <Label htmlFor="port_depart">Port de départ</Label>
                      <Input
                        id="port_depart"
                        value={formData.port_depart}
                        onChange={(e) => handleInputChange('port_depart', e.target.value)}
                        placeholder="Port de Libreville, Gabon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="delai_livraison_estime">Délai de livraison estimé</Label>
                      <Input
                        id="delai_livraison_estime"
                        value={formData.delai_livraison_estime}
                        onChange={(e) => handleInputChange('delai_livraison_estime', e.target.value)}
                        placeholder="7-15 jours ouvrés"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Méthodes de livraison</Label>
                      <Button type="button" onClick={addMethodeLivraison} size="sm" className="bg-gabon-yellow text-gabon-gray hover:bg-gabon-yellow/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une méthode
                      </Button>
                    </div>
                    {methodesLivraison.map((methode, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Méthode</Label>
                          <SimpleSelect
                            value={methode.methode}
                            onValueChange={(value) => {
                              const newMethodes = [...methodesLivraison];
                              newMethodes[index].methode = value;
                              setMethodesLivraison(newMethodes);
                            }}
                            placeholder="Sélectionner"
                            options={methodeLivraisonOptions}
                          />
                        </div>
                        <div>
                          <Label>Coût estimé (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={methode.cout_estime}
                            onChange={(e) => {
                              const newMethodes = [...methodesLivraison];
                              newMethodes[index].cout_estime = parseFloat(e.target.value);
                              setMethodesLivraison(newMethodes);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Délai min (jours)</Label>
                          <Input
                            type="number"
                            value={methode.delai_min}
                            onChange={(e) => {
                              const newMethodes = [...methodesLivraison];
                              newMethodes[index].delai_min = parseInt(e.target.value);
                              setMethodesLivraison(newMethodes);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Délai max (jours)</Label>
                          <Input
                            type="number"
                            value={methode.delai_max}
                            onChange={(e) => {
                              const newMethodes = [...methodesLivraison];
                              newMethodes[index].delai_max = parseInt(e.target.value);
                              setMethodesLivraison(newMethodes);
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setMethodesLivraison(prev => prev.filter((_, i) => i !== index))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Conditions */}
            <TabsContent value="conditions">
              <Card>
                <CardHeader className="bg-gradient-to-r from-gabon-green to-gabon-blue">
                  <CardTitle className="text-white">Conditions commerciales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Conditions de paiement acceptées</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {['Virement bancaire', 'Lettre de crédit', 'Paiement à la livraison', 'Paiement anticipé', 'Western Union', 'MoneyGram'].map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={condition}
                            checked={formData.conditions_paiement.includes(condition)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('conditions_paiement', [...formData.conditions_paiement, condition]);
                              } else {
                                handleInputChange('conditions_paiement', formData.conditions_paiement.filter(c => c !== condition));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={condition} className="text-sm font-normal">{condition}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="politique_retour">Politique de retour/remboursement</Label>
                    <Textarea
                      id="politique_retour"
                      value={formData.politique_retour}
                      onChange={(e) => handleInputChange('politique_retour', e.target.value)}
                      placeholder="Décrivez votre politique de retour et remboursement"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="garantie">Service après-vente / Garantie</Label>
                    <Textarea
                      id="garantie"
                      value={formData.garantie}
                      onChange={(e) => handleInputChange('garantie', e.target.value)}
                      placeholder="Décrivez votre garantie et service après-vente"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Certifications */}
            <TabsContent value="certifications">
              <Card>
                <CardHeader className="bg-gradient-to-r from-gabon-green to-gabon-blue">
                  <CardTitle className="text-white">Certifications et spécifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Certifications et labels qualité</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.certifications.map((certification, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {certification}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-red-100"
                            onClick={() => {
                              handleInputChange('certifications', 
                                formData.certifications.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Ex: ISO 9001, CE, Bio..."
                          className="w-48"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const certification = input.value.trim();
                              if (certification && !formData.certifications.includes(certification)) {
                                handleInputChange('certifications', [...formData.certifications, certification]);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                            const certification = input?.value.trim();
                            if (certification && !formData.certifications.includes(certification)) {
                              handleInputChange('certifications', [...formData.certifications, certification]);
                              input.value = '';
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Spécifications techniques</Label>
                      <Button type="button" onClick={addSpecification} size="sm" className="bg-gabon-yellow text-gabon-gray hover:bg-gabon-yellow/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une spécification
                      </Button>
                    </div>
                    {specifications.map((spec, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Nom</Label>
                          <Input
                            value={spec.nom}
                            onChange={(e) => {
                              const newSpecs = [...specifications];
                              newSpecs[index].nom = e.target.value;
                              setSpecifications(newSpecs);
                            }}
                            placeholder="Ex: Matière"
                          />
                        </div>
                        <div>
                          <Label>Valeur</Label>
                          <Input
                            value={spec.valeur}
                            onChange={(e) => {
                              const newSpecs = [...specifications];
                              newSpecs[index].valeur = e.target.value;
                              setSpecifications(newSpecs);
                            }}
                            placeholder="Ex: 100% Coton"
                          />
                        </div>
                        <div>
                          <Label>Unité</Label>
                          <Input
                            value={spec.unite}
                            onChange={(e) => {
                              const newSpecs = [...specifications];
                              newSpecs[index].unite = e.target.value;
                              setSpecifications(newSpecs);
                            }}
                            placeholder="Ex: %"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setSpecifications(prev => prev.filter((_, i) => i !== index))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/supplier/dashboard')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] bg-gabon-green hover:bg-gabon-green/90 text-white"
            >
              {isSubmitting ? "Création..." : "Créer le produit"}
            </Button>
          </div>
        </form>


      </div>
        </div>
      </SupplierProfileCheck>
    </SupplierLayout>
  );
};

export default AddProduct;