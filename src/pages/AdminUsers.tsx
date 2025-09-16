import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    ShoppingCart,
    FileText
} from "lucide-react";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import EditUserModal from "@/components/admin/EditUserModal";
import DeleteUserModal from "@/components/admin/DeleteUserModal";
import SuspendUserModal from "@/components/admin/SuspendUserModal";
import { DocumentValidationModal } from "@/components/admin/DocumentValidationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    photo_profil?: string;
}

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // États pour les modals
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);
    const [selectedSupplierForDocuments, setSelectedSupplierForDocuments] = useState<User | null>(null);

    // Debounce pour la recherche
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de délai

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, roleFilter, statusFilter, debouncedSearchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Debug: vérifier le token
            const token = localStorage.getItem('authToken');
            console.log('Token présent:', !!token);
            console.log('Token (premiers caractères):', token?.substring(0, 20) + '...');

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                ...(roleFilter !== 'all' && { role: roleFilter }),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(debouncedSearchTerm && { search: debouncedSearchTerm })
            });

            console.log('Requête vers:', `/admin/users?${params}`);

            const response = await apiClient.get(`/admin/users?${params}`);
            console.log('Response complète:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response || {}));

            // L'apiClient retourne directement les données, pas dans response.data
            if (response && (response as any).users) {
                console.log('Format: response.users');
                setUsers((response as any).users);
                setTotalPages((response as any).pagination?.totalPages || 1);
            } else if (Array.isArray(response)) {
                console.log('Format: Array direct');
                setUsers(response);
                setTotalPages(1);
            } else if (response) {
                console.log('Format: Autre objet');
                console.log('Contenu:', response);
                setUsers([]);
                setTotalPages(1);
            } else {
                console.error('Pas de données dans la réponse');
                setUsers([]);
                setTotalPages(1);
            }
        } catch (error: any) {
            console.error('Erreur complète:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            toast.error(`Erreur: ${error.message}`);
            setUsers([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (roleId: number, roleName: string) => {
        switch (roleId) {
            case 1:
                return <Badge className="bg-blue-100 text-blue-800"><ShoppingCart className="w-3 h-3 mr-1" />Acheteur</Badge>;
            case 2:
                return <Badge className="bg-green-100 text-green-800"><Building className="w-3 h-3 mr-1" />Fournisseur</Badge>;
            case 3:
                return <Badge className="bg-purple-100 text-purple-800"><UserCheck className="w-3 h-3 mr-1" />Admin</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{roleName}</Badge>;
        }
    };

    // Fonction pour déterminer le statut effectif d'un utilisateur
    const getEffectiveStatus = (user: User): string => {
        // Utiliser le statut effectif calculé par le backend si disponible
        return (user as any).effective_status || user.statut;
    };

    const getStatusBadge = (user: User) => {
        const effectiveStatus = getEffectiveStatus(user);
        
        switch (effectiveStatus) {
            case 'actif':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
            case 'suspendu':
                return <Badge className="bg-red-100 text-red-800"><Ban className="w-3 h-3 mr-1" />Suspendu</Badge>;
            case 'en_attente':
                return <Badge className="bg-yellow-100 text-yellow-800"><UserX className="w-3 h-3 mr-1" />En attente</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{effectiveStatus}</Badge>;
        }
    };



    // Gestionnaires pour les modals
    const handleViewUser = (user: User) => {
        setSelectedUserId(user.id);
        setShowDetailsModal(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUserId(user.id);
        setShowEditModal(true);
    };

    const handleSuspendUser = (user: User) => {
        setSelectedUser(user);
        setShowSuspendModal(true);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleViewDocuments = (user: User) => {
        setSelectedSupplierForDocuments(user);
        setShowDocumentsModal(true);
    };

    const closeAllModals = () => {
        setSelectedUserId(null);
        setSelectedUser(null);
        setShowDetailsModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowSuspendModal(false);
        setShowDocumentsModal(false);
        setSelectedSupplierForDocuments(null);
    };

    const handleUserUpdated = () => {
        fetchUsers();
        closeAllModals();
    };

    if (loading) {
        return (
            <AdminLayout activeTab="users" onTabChange={() => { }}>
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
        <AdminLayout activeTab="users" onTabChange={() => { }}>
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
                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                            window.location.href = "/user-type";
                        }}
                    >
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
                                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage 
                                                    src={user.photo_profil ? `${import.meta.env.VITE_BACKEND_URL}${user.photo_profil}` : undefined} 
                                                    alt={`${user.prenom} ${user.nom}`} 
                                                />
                                                <AvatarFallback className="bg-gray-200">
                                                    <Users className="w-6 h-6 text-gray-600" />
                                                </AvatarFallback>
                                            </Avatar>
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
                                            {getStatusBadge(user)}
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

                                    <div className="flex gap-2 flex-wrap">
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

                                        {/* Bouton Documents - uniquement pour les fournisseurs */}
                                        {user.role_id === 2 && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-blue-600 hover:text-blue-700"
                                                onClick={() => handleViewDocuments(user)}
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                Documents
                                            </Button>
                                        )}

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

            {/* Modals - Toujours rendus pour éviter les problèmes DOM */}
            <UserDetailsModal
                userId={selectedUserId}
                isOpen={showDetailsModal}
                onClose={closeAllModals}
            />

            <EditUserModal
                userId={selectedUserId}
                isOpen={showEditModal}
                onClose={closeAllModals}
                onUserUpdated={handleUserUpdated}
            />

            <SuspendUserModal
                user={selectedUser}
                isOpen={showSuspendModal}
                onClose={closeAllModals}
                onUserUpdated={handleUserUpdated}
            />

            <DeleteUserModal
                user={selectedUser}
                isOpen={showDeleteModal}
                onClose={closeAllModals}
                onUserDeleted={handleUserUpdated}
            />

            <DocumentValidationModal
                supplierId={selectedSupplierForDocuments?.id || 0}
                supplierName={selectedSupplierForDocuments ? `${selectedSupplierForDocuments.prenom} ${selectedSupplierForDocuments.nom}` : ''}
                isOpen={showDocumentsModal}
                onClose={closeAllModals}
            />
        </AdminLayout>
    );
};

export default AdminUsers;