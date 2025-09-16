import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Filter, MapPin, Star, Shield, MessageCircle,
  Building, Package, Clock, Users, Award
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";

import { StarRating } from "@/components/ui/star-rating";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { useIsAuthenticated } from "@/hooks/api/useAuth";

const Suppliers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const isAuthenticated = useIsAuthenticated();
  const [selectedCategory, setSelectedCategory] = useState("");

  // Récupérer les fournisseurs
  const { data: suppliers, isLoading, error: suppliersError } = useQuery({
    queryKey: ['suppliers', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);

        const response = await apiClient.get(`/entreprises?${params.toString()}`);
        return response.entreprises || response.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs:', error);
        toast.error('Erreur lors de la récupération des fournisseurs');
        return [];
      }
    }
  });

  // Récupérer les catégories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/categories');
        return response;
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        return { categories: [] };
      }
    }
  });

  const categories = categoriesData?.categories || categoriesData?.data || [];

  const handleContactSupplier = async (supplier: any) => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour contacter un fournisseur');
      navigate('/login');
      return;
    }

    // Vérifier que le fournisseur a un utilisateur_id
    if (!supplier.utilisateur_id) {
      toast.error('Impossible de contacter ce fournisseur');
      return;
    }

    // Vérifier qu'on a un utilisateur_id valide
    const destinataireId = supplier.utilisateur_id || supplier.user_id;
    if (!destinataireId) {
      console.warn('Pas d\'utilisateur_id trouvé pour le fournisseur:', supplier);
      toast.error('Impossible de contacter ce fournisseur (pas d\'utilisateur associé)');
      return;
    }

    // Rediriger directement vers le chat
    const params = new URLSearchParams({
      supplier: supplier.id.toString(),
      supplierName: supplier.nom_entreprise
    });
    
    navigate(`/messages?${params.toString()}`);
    toast.success(`Redirection vers le chat avec ${supplier.nom_entreprise}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Chargement des fournisseurs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fournisseurs vérifiés</h1>
            <p className="text-gray-600">Découvrez nos partenaires de confiance</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher un fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Toutes catégories</option>
                  {Array.isArray(categories) && categories.map((cat: any) => (
                    <option key={cat.id} value={cat.slug}>{cat.nom}</option>
                  ))}
                </select>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers?.map((supplier: any) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {supplier.nom_entreprise}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <StarRating rating={Number(supplier.note_moyenne) || 0} readonly size="sm" />
                          <span className="text-xs text-gray-600">
                            ({supplier.nombre_avis || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                    {supplier.statut_verification === 'verifie' && (
                      <Badge className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {supplier.description || 'Fournisseur professionnel spécialisé'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">{supplier.nombre_produits || 0} produits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-600">{supplier.delai_traitement || 7}j traitement</span>
                    </div>
                    {supplier.ville && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="text-gray-600">{supplier.ville}, {supplier.pays || 'Gabon'}</span>
                      </div>
                    )}
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {supplier.statut_verification === 'verifie' && (
                      <Badge variant="outline" className="text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Certifié
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      B2B Vérifié
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/suppliers/${supplier.id}`)}
                    >
                      Voir profil
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleContactSupplier(supplier)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {suppliers?.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fournisseur trouvé</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Suppliers;