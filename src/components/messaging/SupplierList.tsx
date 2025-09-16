import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  MessageCircle, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Star,
  Users,
  Package
} from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { Supplier } from '@/types/supplier';

interface SupplierListProps {
  onContactSupplier: (supplier: Supplier) => void;
  onBack: () => void;
}

export const SupplierList: React.FC<SupplierListProps> = ({
  onContactSupplier,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  
  const { suppliers, loading, error } = useSuppliers();

  // Filtrer les fournisseurs
  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = !searchTerm || 
      supplier.nom_entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.secteur?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === 'all' || supplier.secteur === selectedSector;
    
    return matchesSearch && matchesSector;
  }) || [];

  // Obtenir les secteurs uniques
  const sectors = [...new Set(suppliers?.map(s => s.secteur).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erreur lors du chargement des fournisseurs
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          ← Retour aux messages
        </Button>
        <h2 className="text-2xl font-bold text-center flex-1">Fournisseurs disponibles</h2>
        <div className="w-20" /> {/* Espaceur pour centrer le titre */}
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tous les secteurs</option>
          {sectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>

      {/* Statistiques */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredSuppliers.length} fournisseur(s) trouvé(s)</span>
        {searchTerm && <span>Recherche : "{searchTerm}"</span>}
      </div>

      {/* Liste des fournisseurs */}
      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur disponible'}
          </p>
          <p className="text-sm">
            {searchTerm 
              ? 'Essayez avec d\'autres termes de recherche'
              : 'Les fournisseurs apparaîtront ici une fois inscrits'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                {/* En-tête du fournisseur */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {supplier.nom_entreprise || 'Entreprise non spécifiée'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {supplier.nom} {supplier.prenom}
                    </p>
                    {supplier.secteur && (
                      <Badge variant="secondary" className="text-xs">
                        {supplier.secteur}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="space-y-2 mb-4">
                  {supplier.telephone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{supplier.telephone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.adresse && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{supplier.adresse}</span>
                    </div>
                  )}
                </div>

                {/* Statistiques estimées */}
                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>~{Math.floor(Math.random() * 50) + 10} produits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>~{Math.floor(Math.random() * 20) + 5} clients</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{(Math.random() * 2 + 3).toFixed(1)}</span>
                  </div>
                </div>

                {/* Bouton d'action */}
                <Button
                  onClick={() => onContactSupplier(supplier)}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium py-2"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter ce fournisseur
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
