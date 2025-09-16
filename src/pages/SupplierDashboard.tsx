import { useState, useEffect } from "react";
import { Package, Users, TrendingUp, Bell, Settings, LogOut, Plus, Eye, Edit, BarChart3, FileText, MessageCircle, Award, Upload, Building, Trash2, User } from "lucide-react";

import { SupplierDocumentList } from "@/components/supplier/SupplierDocumentList";
import { SupplierStatusBanner } from "@/components/supplier/SupplierStatusBanner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SupplierLayout from "@/components/layout/SupplierLayout";
import { useCurrentUser, useLogout } from "@/hooks/api/useAuth";
import { useNotifications } from "@/hooks/api/useDashboard";
import { useSupplierStats, useSupplierMessages } from "@/hooks/api/useSupplierDashboard";
import { useSupplierProducts } from "@/hooks/api/useSupplierProducts";
import { useSupplierStatus } from "@/hooks/api/useSupplierStatus";
import { useSupplierDocumentRequirements } from "@/hooks/api/useSupplierDocumentRequirements";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatPrice, formatRating, safeInteger } from "@/utils/formatters";

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lire le paramètre tab de l'URL au chargement
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fonction pour changer d'onglet et mettre à jour l'URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Mettre à jour l'URL sans recharger la page
    const newUrl = tab === 'overview' ? '/supplier/dashboard' : `/supplier/dashboard?tab=${tab}`;
    window.history.replaceState({}, '', newUrl);
  };

  const { data: user } = useCurrentUser();
  const { data: stats } = useSupplierStats();
  const { data: supplierProducts } = useSupplierProducts();
  const { data: supplierMessages } = useSupplierMessages();
  const { data: notifications } = useNotifications();
  const { status: supplierStatus, loading: statusLoading } = useSupplierStatus();
  const { data: documentRequirements } = useSupplierDocumentRequirements();

  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Configuration des cartes de statistiques
  const getStatsCards = () => {
    return [
      {
        title: "Produits actifs",
        value: stats?.activeProducts?.toString() || "0",
        change: "+3 ce mois",
        icon: Package,
        color: "text-blue-600",
        action: () => handleTabChange('products')
      },
      {
        title: "Messages",
        value: stats?.messages?.toString() || "0",
        change: `+${supplierMessages?.filter(m => !m.lu).length || 0} nouveaux`,
        icon: MessageCircle,
        color: "text-purple-600",
        action: () => handleTabChange('messages')
      },
      {
        title: "Vues totales",
        value: stats?.totalViews?.toString() || "0",
        change: "+12% ce mois",
        icon: TrendingUp,
        color: "text-green-600",
        action: () => handleTabChange('analytics')
      },
      {
        title: "Note moyenne",
        value: stats?.averageRating ? formatRating(stats.averageRating) : "0.0",
        change: `${stats?.totalReviews || 0} avis`,
        icon: Award,
        color: "text-yellow-600",
        action: () => handleTabChange('analytics')
      }
    ];
  };

  return (
    <SupplierLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Bannière de statut du fournisseur */}
          {!statusLoading && supplierStatus && (
            <SupplierStatusBanner
              status={supplierStatus.status}
              documentsValidated={documentRequirements?.canPublish || false}
              companyName={supplierStatus.companyName}
              onUploadDocuments={() => handleTabChange('documents')}
            />
          )}
          
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                {/* Navigation */}
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleTabChange("overview")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Vue d'ensemble
                  </Button>
                  <Button
                    variant={activeTab === "products" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleTabChange("products")}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Mes produits
                  </Button>
                  <Button
                    variant={activeTab === "messages" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleTabChange("messages")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                  <Button
                    variant={activeTab === "documents" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleTabChange("documents")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Documents
                  </Button>
                </nav>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {/* Section Vue d'ensemble */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Tableau de bord fournisseur 📊
                    </h1>
                    <p className="text-gray-600">
                      Gérez vos produits et analysez vos performances sur GabMarketHub
                    </p>
                  </div>

                  {/* Actions rapides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Button className="flex flex-col items-center p-6 h-auto space-y-2" onClick={() => navigate('/supplier/products/add')}>
                        <Plus className="w-8 h-8" />
                        <span>Ajouter produit</span>
                      </Button>
                      <Button variant="outline" className="flex flex-col items-center p-6 h-auto space-y-2" onClick={() => handleTabChange('analytics')}>
                        <BarChart3 className="w-8 h-8" />
                        <span>Statistiques</span>
                      </Button>
                    </div>
                  </div>

                  {/* Cartes de statistiques */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {getStatsCards().map((card, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={card.action}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{card.title}</p>
                              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                              <p className="text-xs text-gray-500">{card.change}</p>
                            </div>
                            <card.icon className={`w-8 h-8 ${card.color}`} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Produits récents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Produits récents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {supplierProducts && supplierProducts.length > 0 ? (
                        <div className="space-y-4">
                          {supplierProducts.slice(0, 5).map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-medium text-gray-900">{product.nom}</span>
                                  <Badge className={product.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {product.statut === 'actif' ? 'Actif' : 'Inactif'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{product.categorie_nom}</p>
                                <p className="text-sm text-gray-500">{formatPrice(product.prix_unitaire)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => navigate(`/supplier/products/${product.id}/edit`)}>
                                  <Edit className="w-4 h-4 mr-1" />
                                  Modifier
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">Aucun produit</p>
                          <p className="text-sm text-gray-400">
                            Commencez par ajouter votre premier produit
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Section Produits */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Mes produits
                      </h2>
                      <p className="text-gray-600">
                        Gérez votre catalogue de produits
                      </p>
                    </div>
                    <Button onClick={() => navigate('/supplier/products/add')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  </div>

                  {supplierProducts && supplierProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {supplierProducts.map((product) => (
                        <Card key={product.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{product.nom}</h3>
                                <p className="text-sm text-gray-600 mb-2">{product.categorie_nom}</p>
                                <p className="text-lg font-bold text-green-600">{formatPrice(product.prix_unitaire)}</p>
                              </div>
                              <Badge className={product.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {product.statut === 'actif' ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/supplier/products/${product.id}/edit`)}>
                                <Edit className="w-4 h-4 mr-1" />
                                Modifier
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => navigate(`/products/${product.id}`)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Aucun produit</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Commencez par ajouter votre premier produit
                      </p>
                      <Button onClick={() => navigate('/supplier/products/add')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un produit
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Section Messages */}
              {activeTab === "messages" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Messages
                    </h2>
                    <p className="text-gray-600">
                      Gérez vos conversations avec les acheteurs
                    </p>
                  </div>

                  {supplierMessages && supplierMessages.length > 0 ? (
                    <div className="space-y-4">
                      {supplierMessages.map((message) => (
                        <Card key={message.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-900">
                                    {message.expediteur_nom || 'Utilisateur'}
                                  </span>
                                  <Badge variant={message.lu ? "secondary" : "default"}>
                                    {message.lu ? 'Lu' : 'Non lu'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{message.contenu}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Aucun message</p>
                      <p className="text-sm text-gray-400">
                        Vos conversations avec les acheteurs apparaîtront ici
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Section Documents */}
              {activeTab === "documents" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Documents
                    </h2>
                    <p className="text-gray-600">
                      Gérez vos documents de vérification
                    </p>
                  </div>

                  <SupplierDocumentList />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
};

export default SupplierDashboard;