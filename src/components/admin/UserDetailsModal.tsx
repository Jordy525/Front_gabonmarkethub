import { useState, useEffect } from "react";

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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Building,
    CreditCard,
    Shield,
    Clock,
    AlertTriangle,
    CheckCircle,
    X
} from "lucide-react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";

interface UserDetailsModalProps {
    userId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

interface UserDetails {
    // Informations utilisateur
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role_id: number;
    role_nom: string;
    statut: string;
    date_inscription: string;
    date_creation: string;
    derniere_connexion: string;
    photo_profil?: string;
    email_verified: boolean;
    phone_verified: boolean;
    suspension_reason: string;
    suspended_by: number;
    suspended_at: string;
    notes_admin: string;

    // Informations entreprise (pour fournisseurs)
    entreprise?: {
        nom_entreprise: string;
        description: string;
        secteur_activite: string;
        telephone_professionnel: string;
        adresse_ligne1: string;
        adresse_ligne2: string;
        ville: string;
        code_postal: string;
        pays: string;
        site_web: string;
        numero_siret: string;
        numero_registre_commerce: string;
        numero_tva: string;
        statut_verification: string;
        nom_banque: string;
        iban: string;
        nom_titulaire_compte: string;
        bic_swift: string;
        annee_creation: number;
        nombre_employes: number;
        capacite_production: string;
        certifications: string;
    };

    // Statistiques
    stats?: {
        nombre_commandes: number;
        montant_total_commandes: number;
        nombre_produits: number;
        derniere_activite: string;
    };
}

const UserDetailsModal = ({ userId, isOpen, onClose }: UserDetailsModalProps) => {
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId && isOpen) {
            fetchUserDetails();
        }
    }, [userId, isOpen]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            console.log('🔍 Chargement détails utilisateur ID:', userId);

            const response = await apiClient.get<UserDetails>(`/admin/users/${userId}`);
            console.log('✅ Détails utilisateur reçus:', response);
            console.log('📅 Date création:', response.date_creation);
            console.log('📅 Date inscription:', response.date_inscription);
            console.log('📅 Dernière connexion:', response.derniere_connexion);

            setUserDetails(response);
        } catch (error) {
            console.error('❌ Erreur chargement détails utilisateur:', error);

            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            
            if (errorMessage.includes('404')) {
                toast.error('Utilisateur non trouvé');
            } else if (errorMessage.includes('500')) {
                toast.error('Erreur serveur lors du chargement des détails');
            } else {
                toast.error('Erreur lors du chargement des détails');
            }

            // Fermer le modal en cas d'erreur
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (roleId: number, roleName: string) => {
        switch (roleId) {
            case 1:
                return <Badge className="bg-blue-100 text-blue-800"><User className="w-3 h-3 mr-1" />Acheteur</Badge>;
            case 2:
                return <Badge className="bg-green-100 text-green-800"><Building className="w-3 h-3 mr-1" />Fournisseur</Badge>;
            case 3:
                return <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{roleName}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'actif':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
            case 'suspendu':
                return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Suspendu</Badge>;
            case 'inactif':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Inactif</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chargement des détails utilisateur</DialogTitle>
                        <DialogDescription>Récupération des informations en cours...</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des détails...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Protection contre les valeurs nulles - ne pas rendre si pas d'userId
    if (!userId) {
        return null;
    }

    if (!userDetails) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold">
                                Détails de l'utilisateur #{userDetails.id}
                            </DialogTitle>
                            <DialogDescription>
                                Informations complètes de l'utilisateur {userDetails.prenom} {userDetails.nom}
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Informations principales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informations personnelles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Identité</h4>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage 
                                                src={userDetails.photo_profil ? `${import.meta.env.VITE_BACKEND_URL}${userDetails.photo_profil}` : undefined} 
                                                alt={`${userDetails.prenom} ${userDetails.nom}`} 
                                            />
                                            <AvatarFallback className="bg-gray-200">
                                                <User className="w-8 h-8 text-gray-600" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-lg font-medium">{userDetails.prenom} {userDetails.nom}</p>
                                            <div className="flex gap-2 mt-2">
                                                {getRoleBadge(userDetails.role_id, userDetails.role_nom)}
                                                {getStatusBadge(userDetails.statut)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">{userDetails.email}</span>
                                            {userDetails.email_verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        </div>
                                        {userDetails.telephone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">{userDetails.telephone}</span>
                                                {userDetails.phone_verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Dates importantes</h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">
                                                Inscrit le {formatDate(userDetails.date_creation || userDetails.date_inscription)}
                                            </span>
                                        </div>
                                        {userDetails.derniere_connexion && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">
                                                    Dernière connexion: {formatDate(userDetails.derniere_connexion)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations de suspension */}
                    {userDetails.statut === 'suspendu' && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-800">
                                    <AlertTriangle className="w-5 h-5" />
                                    Informations de suspension
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {userDetails.suspended_at && (
                                        <p><strong>Date de suspension:</strong> {new Date(userDetails.suspended_at).toLocaleDateString('fr-FR')}</p>
                                    )}
                                    {userDetails.suspension_reason && (
                                        <p><strong>Raison:</strong> {userDetails.suspension_reason}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Informations entreprise (pour fournisseurs) */}
                    {userDetails.role_id === 2 && userDetails.entreprise && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Informations entreprise
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Entreprise</h4>
                                        <div className="space-y-2">
                                            <p><strong>Nom:</strong> {userDetails.entreprise.nom_entreprise}</p>
                                            {userDetails.entreprise.secteur_activite && (
                                                <p><strong>Secteur:</strong> {userDetails.entreprise.secteur_activite}</p>
                                            )}
                                            {userDetails.entreprise.annee_creation && (
                                                <p><strong>Année de création:</strong> {userDetails.entreprise.annee_creation}</p>
                                            )}
                                            {userDetails.entreprise.nombre_employes && (
                                                <p><strong>Nombre d'employés:</strong> {userDetails.entreprise.nombre_employes}</p>
                                            )}
                                            {userDetails.entreprise.site_web && (
                                                <p><strong>Site web:</strong>
                                                    <a href={userDetails.entreprise.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                                        {userDetails.entreprise.site_web}
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Adresse</h4>
                                        <div className="space-y-1">
                                            {userDetails.entreprise.adresse_ligne1 && (
                                                <p>{userDetails.entreprise.adresse_ligne1}</p>
                                            )}
                                            {userDetails.entreprise.adresse_ligne2 && (
                                                <p>{userDetails.entreprise.adresse_ligne2}</p>
                                            )}
                                            {(userDetails.entreprise.code_postal || userDetails.entreprise.ville) && (
                                                <p>{userDetails.entreprise.code_postal} {userDetails.entreprise.ville}</p>
                                            )}
                                            {userDetails.entreprise.pays && (
                                                <p>{userDetails.entreprise.pays}</p>
                                            )}
                                            {userDetails.entreprise.telephone_professionnel && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <span>{userDetails.entreprise.telephone_professionnel}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Informations légales */}
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-semibold text-gray-900 mb-3">Informations légales</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {userDetails.entreprise.numero_siret && (
                                            <p><strong>SIRET:</strong> {userDetails.entreprise.numero_siret}</p>
                                        )}
                                        {userDetails.entreprise.numero_registre_commerce && (
                                            <p><strong>RC:</strong> {userDetails.entreprise.numero_registre_commerce}</p>
                                        )}
                                        {userDetails.entreprise.numero_tva && (
                                            <p><strong>TVA:</strong> {userDetails.entreprise.numero_tva}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Informations bancaires */}
                                {(userDetails.entreprise.nom_banque || userDetails.entreprise.iban) && (
                                    <div className="mt-6 pt-6 border-t">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Informations bancaires
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {userDetails.entreprise.nom_banque && (
                                                <p><strong>Banque:</strong> {userDetails.entreprise.nom_banque}</p>
                                            )}
                                            {userDetails.entreprise.nom_titulaire_compte && (
                                                <p><strong>Titulaire:</strong> {userDetails.entreprise.nom_titulaire_compte}</p>
                                            )}
                                            {userDetails.entreprise.iban && (
                                                <p><strong>IBAN:</strong> ****{userDetails.entreprise.iban.slice(-4)}</p>
                                            )}
                                            {userDetails.entreprise.bic_swift && (
                                                <p><strong>BIC/SWIFT:</strong> {userDetails.entreprise.bic_swift}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Statistiques */}
                    {userDetails.stats && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistiques d'activité</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{userDetails.stats.nombre_commandes}</div>
                                        <div className="text-sm text-blue-800">Commandes</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {userDetails.stats.montant_total_commandes?.toLocaleString()} FCFA
                                        </div>
                                        <div className="text-sm text-green-800">Montant total</div>
                                    </div>
                                    {userDetails.role_id === 2 && (
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">{userDetails.stats.nombre_produits}</div>
                                            <div className="text-sm text-purple-800">Produits</div>
                                        </div>
                                    )}
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <div className="text-sm font-medium text-yellow-800">Dernière activité</div>
                                        <div className="text-xs text-yellow-600">
                                            {userDetails.stats.derniere_activite ?
                                                new Date(userDetails.stats.derniere_activite).toLocaleDateString('fr-FR') :
                                                'Aucune'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes admin */}
                    {userDetails.notes_admin && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Notes administratives
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 whitespace-pre-wrap">{userDetails.notes_admin}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailsModal;