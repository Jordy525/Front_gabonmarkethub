import { useState, useEffect, useCallback } from "react";

// Fonction utilitaire pour formater les dates de manière sécurisée
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Non disponible";
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Date invalide";
        }
        return date.toLocaleDateString('fr-FR');
    } catch (error) {
        return "Date invalide";
    }
};
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Ban,
    CheckCircle,
    Eye,
    UserCheck,
    UserX,
    Building,
    ShoppingCart
} from "lucide-react";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import EditUserModal from "@/components/admin/EditUserModal";
import DeleteUserModal from "@/components/admin/DeleteUserModal";
import SuspendUserModal from "@/components/admin/SuspendUserModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { apiClient } from "@/services/api";
import { toast } from "sonner";
import { useModalState } from "@/hooks/useModalState";

interface User {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role_id: number;
    role_nom: string;
    statut: string;
    date_creation: string;
    derniere_connexion: string;
    secteur_activite?: string;
    nom_entreprise?: string;
}

const AdminUsersImproved = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // États des modals avec le hook personnalisé
    const detailsModal = useModalState<number>();
    const editModal = useModalState<number>();
    const deleteModal = useModalState<User>();
    const suspendModal = useModalState<User>();

    // Fonctions de gestion des modals
    const handleViewUser = useCallback((user: User) => {
        detailsModal.openModal(user.id);
    }, [detailsModal]);

    const handleEditUser = useCallback((user: User) => {
        editModal.openModal(user.id);
    }, [editModal]);

    const handleDeleteUser = useCallback((user: User) => {
        deleteModal.openModal(user);
    }, [deleteModal]);

    const handleSuspendUser = useCallback((user: User) => {
        suspendModal.openModal(user);
    }, [suspendModal]);

    const closeAllModals = useCallback(() => {
        detailsModal.closeModal();
        editModal.closeModal();
        deleteModal.closeModal();
        suspendModal.closeModal();
    }, [detailsModal, editModal, deleteModal, suspendModal]);

    const handleUserUpdated = useCallback(() => {
        fetchUsers();
        closeAllModals();
    }, [closeAllModals]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                ...(roleFilter !== 'all' && { role: roleFilter }),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await apiClient.get(`/admin/users?${params}`);
            
            if (response && response.users) {
                setUsers(response.users);
                setTotalPages(response.pagination?.totalPages || 1);
            } else if (Array.isArray(response)) {
                setUsers(response);
            } else {
                console.error('Format de réponse inattendu:', response);
                setUsers([]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            toast.error('Erreur lors du chargement des utilisateurs');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, roleFilter, statusFilter, searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const getRoleBadge = (roleId: number, roleName: string) => {
        const roleConfig = {
            1: { color: "bg-blue-100 text-blue-800", icon: ShoppingCart, label: "Acheteur" },
            2: { color: "bg-green-100 text-green-800", icon: Building, label: "Fournisseur" },
            3: { color: "bg-purple-100 text-purple-800", icon: UserCheck, label: "Admin" }
        };

        const config = roleConfig[roleId as keyof typeof roleConfig] || {
            color: "bg-gray-100 text-gray-800",
            icon: Users,
            label: roleName || "Inconnu"
        };

        const IconComponent = config.icon;

        return (
            <Badge className={config.color}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'actif': { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Actif" },
            'suspendu': { color: "bg-red-100 text-red-800", icon: Ban, label: "Suspendu" },
            'en_attente': { color: "bg-yellow-100 text-yellow-800", icon: UserX, label: "En attente" }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            color: "bg-gray-100 text-gray-800",
            icon: Users,
            label: status || "Inconnu"
        };

        const IconComponent = config.icon;

        return (
            <Badge className={config.color}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    if (loading && users.length === 0) {
        return (
            <AdminLayout activeTab="users" onTabChange={() => {}}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des utilisateurs...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeTab="users" onTabChange={() => {}}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Gestion des utilisateurs 👥
                        </h1>
                        <p className="text-gray-600">
                            Gérer les acheteurs, fournisseurs et administrateurs
                        </p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvel utilisateur
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Rechercher un utilisateur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrer par rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les rôles</SelectItem>
                                    <SelectItem value="1">Acheteurs</SelectItem>
                                    <SelectItem value="2">Fournisseurs</SelectItem>
                                    <SelectItem value="3">Administrateurs</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrer par statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="actif">Actifs</SelectItem>
                                    <SelectItem value="suspendu">Suspendus</SelectItem>
                                    <SelectItem value="en_attente">En attente</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" onClick={fetchUsers}>
                                <Filter className="w-4 h-4 mr-2" />
                                Actualiser
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Liste des utilisateurs ({users.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={`user-${user.id}`} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                <Users className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {user.prenom} {user.nom}
                                                </h3>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                                {user.nom_entreprise && (
                                                    <p className="text-xs text-gray-500">{user.nom_entreprise}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getRoleBadge(user.role_id, user.role_nom)}
                                            {getStatusBadge(user.statut)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                        <div>
                                            <p className="text-gray-600">
                                                <strong>Téléphone:</strong> {user.telephone || 'Non renseigné'}
                                            </p>
                                            <p className="text-gray-600">
                                                <strong>ID:</strong> #{user.id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                <strong>Inscription:</strong> {formatDate(user.date_creation)}
                                            </p>
                                            {user.derniere_connexion && (
                                                <p className="text-gray-600">
                                                    <strong>Dernière connexion:</strong> {formatDate(user.derniere_connexion)}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            {user.secteur_activite && (
                                                <p className="text-gray-600">
                                                    <strong>Secteur:</strong> {user.secteur_activite}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleViewUser(user)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Voir
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Modifier
                                        </Button>
                                        
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className={user.statut === 'actif' ? 
                                                "text-orange-600 hover:text-orange-700" : 
                                                "text-green-600 hover:text-green-700"
                                            }
                                            onClick={() => handleSuspendUser(user)}
                                        >
                                            {user.statut === 'actif' ? (
                                                <>
                                                    <Ban className="w-4 h-4 mr-1" />
                                                    Suspendre
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Activer
                                                </>
                                            )}
                                        </Button>
                                        
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDeleteUser(user)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Précédent
                                </Button>
                                
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} sur {totalPages}
                                </span>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modals - Toujours rendus avec protection contre les valeurs nulles */}
            <UserDetailsModal
                userId={detailsModal.data}
                isOpen={detailsModal.isOpen}
                onClose={detailsModal.closeModal}
            />

            <EditUserModal
                userId={editModal.data}
                isOpen={editModal.isOpen}
                onClose={editModal.closeModal}
                onUserUpdated={handleUserUpdated}
            />

            <SuspendUserModal
                user={suspendModal.data}
                isOpen={suspendModal.isOpen}
                onClose={suspendModal.closeModal}
                onUserUpdated={handleUserUpdated}
            />

            <DeleteUserModal
                user={deleteModal.data}
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.closeModal}
                onUserDeleted={handleUserUpdated}
            />
        </AdminLayout>
    );
};

export default AdminUsersImproved;