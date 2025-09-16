import { useState, useEffect } from "react";
import {
    Users,
    Building,
    BarChart3,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdminStats {
    total_fournisseurs: number;
    total_acheteurs: number;
}

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            console.log('🔍 Récupération des statistiques admin...');

            // Vérifier le token d'authentification
            const token = localStorage.getItem('authToken');
            console.log('Token présent:', !!token);

            // Fetch admin stats
            const statsResponse = await apiClient.get<AdminStats>('/admin/stats');
            console.log('📊 Statistiques reçues:', statsResponse);
            setStats(statsResponse);

        } catch (error) {
            console.error('❌ Erreur chargement données admin:', error);
            console.error('Détails de l\'erreur:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };


    const getAdminStats = () => {
        if (!stats) return [];

        return [
            {
                title: "Fournisseurs actifs",
                value: stats.total_fournisseurs.toString(),
                change: "Partenaires vérifiés",
                icon: Building,
                color: "text-green-600",
                action: () => setActiveTab('suppliers')
            },
            {
                title: "Acheteurs",
                value: stats.total_acheteurs.toString(),
                change: "Clients enregistrés",
                icon: Users,
                color: "text-purple-600",
                action: () => setActiveTab('buyers')
            }
        ];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        // La navigation est maintenant gérée dans AdminLayout
    };

    return (
        <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tableau de bord administrateur
                    </h1>
                    <p className="text-gray-600">
                        Supervision de la plateforme et gestion des utilisateurs
                    </p>
                </div>

                {/* Content */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {getAdminStats().map((stat, index) => (
                                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={stat.action}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 rounded-lg bg-gray-50">
                                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 mb-1">
                                                {stat.value}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                            <p className="text-xs text-gray-500">{stat.change}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Actions rapides */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                                window.location.href = "/user-type";
                            }}>
                                <CardContent className="p-6 text-center">
                                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <h3 className="font-semibold text-gray-900 mb-2">Nouvel utilisateur</h3>
                                    <p className="text-sm text-gray-600">Créer un compte fournisseur ou acheteur</p>
                                </CardContent>
                            </Card>

                            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('analytics')}>
                                <CardContent className="p-6 text-center">
                                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                                    <h3 className="font-semibold text-gray-900 mb-2">Voir analyses</h3>
                                    <p className="text-sm text-gray-600">Rapports et statistiques</p>
                                </CardContent>
                            </Card>
                        </div>


                    </div>
                )}


                {activeTab === "analytics" && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Rapport d'analyse complet
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="text-center p-6 bg-green-50 rounded-lg">
                                        <div className="text-3xl font-bold text-green-600 mb-2">
                                            {stats ? stats.total_fournisseurs : 0}
                                        </div>
                                        <div className="text-sm text-green-800">Fournisseurs actifs</div>
                                        <div className="text-xs text-green-600 mt-1">
                                            Partenaires vérifiés
                                        </div>
                                    </div>

                                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">
                                            {stats ? stats.total_acheteurs : 0}
                                        </div>
                                        <div className="text-sm text-purple-800">Acheteurs enregistrés</div>
                                        <div className="text-xs text-purple-600 mt-1">
                                            Clients de la plateforme
                                        </div>
                                    </div>
                                </div>

                                {/* Analyses détaillées */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Statistiques utilisateurs</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                                    <span className="text-sm">Total utilisateurs</span>
                                                    <span className="font-bold text-green-600">
                                                        {stats ? (stats.total_fournisseurs + stats.total_acheteurs) : 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                                    <span className="text-sm">Fournisseurs</span>
                                                    <span className="font-bold text-blue-600">
                                                        {stats ? stats.total_fournisseurs : 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                                                    <span className="text-sm">Acheteurs</span>
                                                    <span className="font-bold text-purple-600">
                                                        {stats ? stats.total_acheteurs : 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Activité de la plateforme</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                                    <span className="text-sm">Plateforme active</span>
                                                    <span className="font-bold text-green-600">✓</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                                    <span className="text-sm">Gestion des documents</span>
                                                    <span className="font-bold text-blue-600">✓</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                                                    <span className="text-sm">Validation des fournisseurs</span>
                                                    <span className="font-bold text-purple-600">✓</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;