import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Building2, 
  Star, 
  MessageCircle, 
  MapPin,
  Shield,
  Users,
  Package,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

interface Supplier {
  id: number;
  utilisateur_id: number;
  nom_entreprise: string;
  description?: string;
  secteur_activite?: string;
  ville?: string;
  pays?: string;
  note_moyenne?: number;
  nombre_avis?: number;
  statut_verification?: string;
  nombre_produits?: number;
  logo_url?: string;
}

interface SupplierContactListProps {
  onContactSupplier: (supplier: Supplier) => void;
  onBack?: () => void;
  className?: string;
}

export const SupplierContactList: React.FC<SupplierContactListProps> = ({
  onContactSupplier,
  onBack,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  // Récupérer les fournisseurs
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers-contact-list', searchTerm, selectedSector, selectedCity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSector !== 'all') params.append('secteur', selectedSector);
      if (selectedCity !== 'all') params.append('ville', selectedCity);
      
      // Récupérer tous les fournisseurs sans limite
      params.append('limit', '100');
      
      const response = await apiClient.get(`/entreprises?${params.toString()}`);
      return (response as any).entreprises || (response as any).data || [];
    },
    staleTime: 30000,
  });

  // Récupérer les secteurs d'activité
  const { data: sectors = [], isLoading: sectorsLoading } = useQuery({
    queryKey: ['supplier-sectors'],
    queryFn: async () => {
      const response = await apiClient.get('/sectors');
      return (response as any).sectors || (response as any).data || [];
    },
    staleTime: 300000, // 5 minutes
  });

  // Récupérer les villes
  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ['supplier-cities'],
    queryFn: async () => {
      const response = await apiClient.get('/cities');
      return (response as any).cities || (response as any).data || [];
    },
    staleTime: 300000, // 5 minutes
  });

  // Filtrer les fournisseurs
  const filteredSuppliers = suppliers.filter((supplier: Supplier) => {
    // Recherche plus complète
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      supplier.nom_entreprise.toLowerCase().includes(searchLower) ||
      supplier.description?.toLowerCase().includes(searchLower) ||
      supplier.secteur_activite?.toLowerCase().includes(searchLower) ||
      supplier.ville?.toLowerCase().includes(searchLower) ||
      supplier.pays?.toLowerCase().includes(searchLower);
    
    const matchesSector = selectedSector === 'all' || supplier.secteur_activite === selectedSector;
    const matchesCity = selectedCity === 'all' || supplier.ville === selectedCity;
    
    return matchesSearch && matchesSector && matchesCity;
  });

  const handleContactSupplier = async (supplier: Supplier) => {
    try {
      // Créer la conversation d'abord
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Vous devez être connecté pour contacter un fournisseur');
        return;
      }

      // Créer la conversation
      const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fournisseur_id: supplier.utilisateur_id,
          sujet: `Conversation avec ${supplier.nom_entreprise}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la conversation');
      }

      const conversationData = await response.json();
      
      // Rediriger vers le chat avec l'ID de la conversation
      const params = new URLSearchParams({
        conversation: conversationData.data?.id?.toString() || '',
        supplier: supplier.utilisateur_id.toString(),
        supplierName: supplier.nom_entreprise
      });
      
      window.location.href = `/messages?${params.toString()}`;
      toast.success(`Conversation créée avec ${supplier.nom_entreprise}`);
    } catch (error: any) {
      console.error('Erreur création conversation:', error);
      toast.error(error.message || 'Erreur lors de la création de la conversation');
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Building2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-4">
              Impossible de charger la liste des fournisseurs
            </p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
            ← Retour
          </Button>
        )}
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-bold">Contacter un fournisseur</h2>
          <p className="text-gray-600 mt-1">
            Choisissez un fournisseur pour commencer une conversation
          </p>
        </div>
        <div className="w-20" /> {/* Espaceur pour centrer le titre */}
      </div>

      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Secteur d'activité */}
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white w-full"
                disabled={sectorsLoading}
              >
                <option value="all">
                  {sectorsLoading ? 'Chargement...' : 'Tous les secteurs'}
                </option>
                {sectors.map((sector: string) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
              {sectorsLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Ville */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white w-full"
                disabled={citiesLoading}
              >
                <option value="all">
                  {citiesLoading ? 'Chargement...' : 'Toutes les villes'}
                </option>
                {cities.map((city: string) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {citiesLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>{filteredSuppliers.length} fournisseur(s) trouvé(s)</span>
        {searchTerm && <span>Recherche : "{searchTerm}"</span>}
      </div>

      {/* Liste des fournisseurs avec scroll */}
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun fournisseur trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSector('all');
                  setSelectedCity('all');
                }}
              >
                Effacer les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier: Supplier) => (
              <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {supplier.logo_url ? (
                          <img 
                            src={supplier.logo_url} 
                            alt={supplier.nom_entreprise}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          supplier.nom_entreprise[0]?.toUpperCase() || 'F'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {supplier.nom_entreprise}
                        </h3>
                        {supplier.statut_verification === 'verifie' && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>
                          {supplier.note_moyenne ? Number(supplier.note_moyenne).toFixed(1) : 'N/A'}
                          ({supplier.nombre_avis || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  {supplier.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {supplier.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    {supplier.secteur_activite && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{supplier.secteur_activite}</span>
                      </div>
                    )}
                    {supplier.ville && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{supplier.ville}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Package className="w-3 h-3" />
                      <span>{supplier.nombre_produits || 0} produits</span>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleContactSupplier(supplier)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
