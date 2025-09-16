import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleSelect } from "@/components/ui/SimpleSelect";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { getImageUrl } from "@/config/constants";
import SupplierLayout from "@/components/layout/SupplierLayout";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  // Options statiques pour les Select
  const uniteOptions = [
    { id: "pièce", nom: "Pièce" },
    { id: "kg", nom: "Kilogramme" },
    { id: "m", nom: "Mètre" },
    { id: "m²", nom: "Mètre carré" },
    { id: "litre", nom: "Litre" }
  ];
  const [formData, setFormData] = useState({
    nom: "",
    marque: "",
    reference_produit: "",
    categorie_id: "",
    description: "",
    description_longue: "",
    fonctionnalites: "",
    instructions_utilisation: "",
    materiaux: "",
    couleurs_disponibles: [] as string[],
    certifications: [] as string[],
    delai_traitement: "7",
    capacite_approvisionnement: "",
    port_depart: "",
    conditions_paiement: [] as string[],
    delai_livraison_estime: "",
    politique_retour: "",
    garantie: "",
    video_url: "",
    prix_unitaire: "",
    moq: "1",
    stock_disponible: "",
    unite: "pièce",
    poids: "",
    dimensions: ""
  });

  const [prixDegressifs, setPrixDegressifs] = useState<any[]>([]);

  // Récupérer les catégories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories')
  });
  
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || [];

  // Récupérer les données du produit
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.get(`/products/${id}`),
    enabled: !!id
  });

  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;
      setFormData({
        nom: product.nom || "",
        marque: product.marque || "",
        reference_produit: product.reference_produit || "",
        categorie_id: product.categorie_id?.toString() || "",
        description: product.description || "",
        description_longue: product.description_longue || "",
        fonctionnalites: product.fonctionnalites || "",
        instructions_utilisation: product.instructions_utilisation || "",
        materiaux: product.materiaux || "",
        couleurs_disponibles: product.couleurs_disponibles || [],
        certifications: product.certifications || [],
        delai_traitement: product.delai_traitement?.toString() || "7",
        capacite_approvisionnement: product.capacite_approvisionnement?.toString() || "",
        port_depart: product.port_depart || "",
        conditions_paiement: product.conditions_paiement || [],
        delai_livraison_estime: product.delai_livraison_estime || "",
        politique_retour: product.politique_retour || "",
        garantie: product.garantie || "",
        video_url: product.video_url || "",
        prix_unitaire: product.prix_unitaire?.toString() || "",
        moq: product.moq?.toString() || "1",
        stock_disponible: product.stock_disponible?.toString() || "",
        unite: product.unite || "pièce",
        poids: product.poids?.toString() || "",
        dimensions: product.dimensions || ""
      });
      setExistingImages(product.images || []);
      setPrixDegressifs(product.prix_degressifs || []);
    }
  }, [productData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: number) => {
    try {
      // ✅ UTILISER apiClient au lieu de fetch
      await apiClient.delete(`/products/${id}/images/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success("Image supprimée");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression de l'image");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparer les données avec les prix dégressifs
      const dataToSend = {
        ...formData,
        prix_degressifs: prixDegressifs
      };

      console.log('🚀 [EditProduct] Début de la mise à jour du produit:', {
        productId: id,
        dataToSend: dataToSend
      });

      // ✅ UTILISER apiClient au lieu de fetch
      const response = await apiClient.put(`/products/${id}`, dataToSend);
      
      console.log('✅ [EditProduct] Réponse de mise à jour:', response);
      
      // Vérifier si la réponse indique un succès
      if (!response) {
        throw new Error('Aucune réponse du serveur');
      }

      // Upload des nouvelles images
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach(file => {
          imageFormData.append('images', file);
        });

        // ✅ UTILISER apiClient pour les images aussi
        try {
          await apiClient.request(`/products/${id}/images`, {
            method: 'POST',
            body: imageFormData
            // Pas de headers pour FormData - laisse le navigateur gérer
          });
        } catch (error) {
          console.warn('Erreur lors de l\'upload des images:', error);
        }
      }

      toast.success("Produit mis à jour avec succès !");
      navigate('/supplier/dashboard');

    } catch (error: any) {
      console.error('❌ [EditProduct] Erreur détaillée:', {
        message: error.message,
        status: error.status,
        response: error.response,
        data: error.data,
        fullError: error
      });
      
      // Afficher un message d'erreur plus spécifique
      let errorMessage = "Erreur lors de la mise à jour du produit";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SupplierLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Chargement du produit...</p>
          </div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Modifier le produit</h1>
            <p className="text-gray-600 mt-2">Modifiez les informations de votre produit</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="prix">Prix</TabsTrigger>
                <TabsTrigger value="livraison">Livraison</TabsTrigger>
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom">Nom du produit *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="marque">Marque</Label>
                    <Input
                      id="marque"
                      value={formData.marque}
                      onChange={(e) => handleInputChange('marque', e.target.value)}
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="categorie_id">Catégorie *</Label>
                    <SimpleSelect
                      value={formData.categorie_id}
                      onValueChange={(value) => handleInputChange('categorie_id', value)}
                      placeholder="Sélectionner une catégorie"
                      options={categories}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description courte</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="description_longue">Description détaillée *</Label>
                  <Textarea
                    id="description_longue"
                    value={formData.description_longue}
                    onChange={(e) => handleInputChange('description_longue', e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="prix_unitaire">Prix unitaire (€) *</Label>
                    <Input
                      id="prix_unitaire"
                      type="number"
                      step="0.01"
                      value={formData.prix_unitaire}
                      onChange={(e) => handleInputChange('prix_unitaire', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="moq">MOQ *</Label>
                    <Input
                      id="moq"
                      type="number"
                      value={formData.moq}
                      onChange={(e) => handleInputChange('moq', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_disponible">Stock disponible</Label>
                    <Input
                      id="stock_disponible"
                      type="number"
                      value={formData.stock_disponible}
                      onChange={(e) => handleInputChange('stock_disponible', e.target.value)}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="poids">Poids (kg)</Label>
                    <Input
                      id="poids"
                      type="number"
                      step="0.01"
                      value={formData.poids}
                      onChange={(e) => handleInputChange('poids', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      placeholder="L x l x h"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delai_traitement">Délai traitement (jours)</Label>
                    <Input
                      id="delai_traitement"
                      type="number"
                      value={formData.delai_traitement}
                      onChange={(e) => handleInputChange('delai_traitement', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fonctionnalites">Fonctionnalités</Label>
                  <Textarea
                    id="fonctionnalites"
                    value={formData.fonctionnalites}
                    onChange={(e) => handleInputChange('fonctionnalites', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="materiaux">Matériaux</Label>
                    <Input
                      id="materiaux"
                      value={formData.materiaux}
                      onChange={(e) => handleInputChange('materiaux', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="garantie">Garantie</Label>
                    <Input
                      id="garantie"
                      value={formData.garantie}
                      onChange={(e) => handleInputChange('garantie', e.target.value)}
                      placeholder="Ex: 2 ans"
                    />
                  </div>
                </div>

                    <div>
                      <Label htmlFor="instructions_utilisation">Instructions d'utilisation</Label>
                      <Textarea
                        id="instructions_utilisation"
                        value={formData.instructions_utilisation}
                        onChange={(e) => handleInputChange('instructions_utilisation', e.target.value)}
                        rows={3}
                      />
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
                            placeholder="Ajouter couleur"
                            className="w-32"
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
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Certifications</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {cert}
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
                            placeholder="Ajouter certification"
                            className="w-40"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                const cert = input.value.trim();
                                if (cert && !formData.certifications.includes(cert)) {
                                  handleInputChange('certifications', [...formData.certifications, cert]);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images">

                <Card>
                  <CardHeader>
                    <CardTitle>Images du produit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                {/* Images existantes */}
                {existingImages.length > 0 && (
                  <div>
                    <Label>Images actuelles</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {existingImages.map((image, index) => (
                        <div key={image.id} className="relative">
                          <img
                            src={getImageUrl(image.url)}
                            alt="Image produit"
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={() => removeExistingImage(image.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          {image.principale && (
                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nouvelles images */}
                <div>
                  <Label htmlFor="images">Ajouter des images</Label>
                  <div className="mt-2">
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('images')?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Sélectionner des images
                    </Button>
                  </div>
                </div>

                {/* Prévisualisation nouvelles images */}
                {selectedImages.length > 0 && (
                  <div>
                    <Label>Nouvelles images à ajouter</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Nouvelle image"
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={() => removeSelectedImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prix">
              <Card>
                <CardHeader>
                  <CardTitle>Prix et options d'achat</CardTitle>
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
                        onChange={(e) => handleInputChange('prix_unitaire', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="moq">MOQ *</Label>
                      <Input
                        id="moq"
                        type="number"
                        value={formData.moq}
                        onChange={(e) => handleInputChange('moq', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock_disponible">Stock disponible</Label>
                      <Input
                        id="stock_disponible"
                        type="number"
                        value={formData.stock_disponible}
                        onChange={(e) => handleInputChange('stock_disponible', e.target.value)}
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
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Prix dégressifs</Label>
                      <Button type="button" onClick={addPrixDegressif} size="sm">
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

            <TabsContent value="livraison">
              <Card>
                <CardHeader>
                  <CardTitle>Expédition et livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="delai_traitement">Délai traitement (jours)</Label>
                      <Input
                        id="delai_traitement"
                        type="number"
                        value={formData.delai_traitement}
                        onChange={(e) => handleInputChange('delai_traitement', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="port_depart">Port de départ</Label>
                      <Input
                        id="port_depart"
                        value={formData.port_depart}
                        onChange={(e) => handleInputChange('port_depart', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="delai_livraison_estime">Délai de livraison estimé</Label>
                      <Input
                        id="delai_livraison_estime"
                        value={formData.delai_livraison_estime}
                        onChange={(e) => handleInputChange('delai_livraison_estime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="poids">Poids (kg)</Label>
                      <Input
                        id="poids"
                        type="number"
                        step="0.01"
                        value={formData.poids}
                        onChange={(e) => handleInputChange('poids', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => handleInputChange('dimensions', e.target.value)}
                        placeholder="L x l x h"
                      />
                    </div>
                    <div>
                      <Label htmlFor="video_url">URL Vidéo</Label>
                      <Input
                        id="video_url"
                        value={formData.video_url}
                        onChange={(e) => handleInputChange('video_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conditions">
              <Card>
                <CardHeader>
                  <CardTitle>Conditions commerciales</CardTitle>
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
                    <Label htmlFor="politique_retour">Politique de retour</Label>
                    <Textarea
                      id="politique_retour"
                      value={formData.politique_retour}
                      onChange={(e) => handleInputChange('politique_retour', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="garantie">Garantie</Label>
                    <Textarea
                      id="garantie"
                      value={formData.garantie}
                      onChange={(e) => handleInputChange('garantie', e.target.value)}
                      rows={3}
                    />
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
                {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SupplierLayout>
  );
};

export default EditProduct;