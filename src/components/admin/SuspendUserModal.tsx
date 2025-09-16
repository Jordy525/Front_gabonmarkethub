import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Ban,
    X,
    User,
    Building,
    Shield,
    CheckCircle
} from "lucide-react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";

interface SuspendUserModalProps {
    user: {
        id: number;
        nom: string;
        prenom: string;
        email: string;
        role_id: number;
        role_nom: string;
        statut: string;
        nom_entreprise?: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
}

const SuspendUserModal = ({ user, isOpen, onClose, onUserUpdated }: SuspendUserModalProps) => {
    const [reason, setReason] = useState("");
    const [processing, setProcessing] = useState(false);

    const isSuspended = user?.statut === 'suspendu';

    const handleAction = async () => {
        if (!user) return;
        
        if (!isSuspended && !reason.trim()) {
            toast.error('Veuillez indiquer une raison pour la suspension');
            return;
        }

        try {
            setProcessing(true);
            
            if (isSuspended) {
                // Réactiver l'utilisateur
                await apiClient.patch(`/admin/users/${user.id}/activate`);
                toast.success('Utilisateur réactivé avec succès');
            } else {
                // Suspendre l'utilisateur
                await apiClient.patch(`/admin/users/${user.id}/suspend`, {
                    suspension_reason: reason.trim()
                });
                toast.success('Utilisateur suspendu avec succès');
            }
            
            onUserUpdated();
            onClose();
            setReason("");
        } catch (error) {
            console.error('Erreur lors de l\'action:', error);
            toast.error(`Erreur lors de ${isSuspended ? 'la réactivation' : 'la suspension'}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setReason("");
        onClose();
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
                return <Badge className="bg-red-100 text-red-800"><Ban className="w-3 h-3 mr-1" />Suspendu</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent key={user?.id} className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className={`text-xl font-bold flex items-center gap-2 ${
                                isSuspended ? 'text-green-600' : 'text-orange-600'
                            }`}>
                                {isSuspended ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Réactiver l'utilisateur
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-5 h-5" />
                                        Suspendre l'utilisateur
                                    </>
                                )}
                            </DialogTitle>
                            <DialogDescription>
                                {isSuspended ? 'Réactivation' : 'Suspension'} du compte de {user.prenom} {user.nom}
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Informations utilisateur */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                            Utilisateur concerné :
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Nom :</span>
                                <span className="font-medium">{user.prenom} {user.nom}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Email :</span>
                                <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Rôle :</span>
                                {getRoleBadge(user.role_id, user.role_nom)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Statut actuel :</span>
                                {getStatusBadge(user.statut)}
                            </div>
                            {user.nom_entreprise && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Entreprise :</span>
                                    <span className="font-medium">{user.nom_entreprise}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Avertissement ou confirmation */}
                    <div className={`border rounded-lg p-4 ${
                        isSuspended ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            {isSuspended ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                            )}
                            <div>
                                <h3 className={`font-semibold mb-2 ${
                                    isSuspended ? 'text-green-800' : 'text-orange-800'
                                }`}>
                                    {isSuspended ? 'Réactivation du compte' : 'Suspension du compte'}
                                </h3>
                                <p className={`text-sm ${
                                    isSuspended ? 'text-green-700' : 'text-orange-700'
                                }`}>
                                    {isSuspended ? (
                                        'L\'utilisateur pourra à nouveau se connecter et utiliser la plateforme normalement.'
                                    ) : (
                                        'L\'utilisateur ne pourra plus se connecter. Un message "Compte suspendu par l\'administrateur" s\'affichera lors de ses tentatives de connexion.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Raison (pour suspension uniquement) */}
                    {!isSuspended && (
                        <div>
                            <Label htmlFor="reason" className="text-sm font-medium text-gray-900">
                                Raison de la suspension *
                            </Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Expliquez pourquoi vous suspendez ce compte..."
                                rows={4}
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Cette raison sera visible par l'utilisateur et enregistrée dans les logs.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button 
                            onClick={handleAction} 
                            disabled={processing || (!isSuspended && !reason.trim())}
                            className={isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {isSuspended ? 'Réactivation...' : 'Suspension...'}
                                </>
                            ) : (
                                <>
                                    {isSuspended ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Réactiver le compte
                                        </>
                                    ) : (
                                        <>
                                            <Ban className="w-4 h-4 mr-2" />
                                            Suspendre le compte
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SuspendUserModal;