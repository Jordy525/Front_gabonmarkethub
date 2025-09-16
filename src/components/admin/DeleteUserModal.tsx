import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Trash2,
    X,
    User,
    Building,
    Shield
} from "lucide-react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";

interface DeleteUserModalProps {
    user: {
        id: number;
        nom: string;
        prenom: string;
        email: string;
        role_id: number;
        role_nom: string;
        nom_entreprise?: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onUserDeleted: () => void;
}

const DeleteUserModal = ({ user, isOpen, onClose, onUserDeleted }: DeleteUserModalProps) => {
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    // Protection contre les valeurs nulles
    if (!user) {
        return null;
    }

    const expectedConfirmText = `SUPPRIMER ${user.email}`;
    const isConfirmValid = confirmText === expectedConfirmText;

    const handleDelete = async () => {
        if (!user || !isConfirmValid) return;

        try {
            setDeleting(true);
            await apiClient.delete(`/admin/users/${user.id}`);
            toast.success('Utilisateur supprimé définitivement');
            onUserDeleted();
            onClose();
            setConfirmText("");
        } catch (error) {
            console.error('Erreur suppression utilisateur:', error);
            toast.error('Erreur lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    const handleClose = () => {
        setConfirmText("");
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

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Suppression définitive
                            </DialogTitle>
                            <DialogDescription>
                                Suppression définitive de l'utilisateur {user.prenom} {user.nom}
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Avertissement */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-800 mb-2">
                                    ⚠️ ATTENTION - Action irréversible
                                </h3>
                                <p className="text-sm text-red-700 mb-2">
                                    Cette action va <strong>supprimer définitivement</strong> l'utilisateur et toutes ses données de la base de données.
                                </p>
                                <ul className="text-xs text-red-600 space-y-1">
                                    <li>• Toutes les données personnelles seront perdues</li>
                                    <li>• L'historique des commandes sera supprimé</li>
                                    <li>• Les informations d'entreprise seront effacées</li>
                                    <li>• Cette action ne peut pas être annulée</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Informations utilisateur */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Utilisateur à supprimer :</h4>
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
                            {user.nom_entreprise && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Entreprise :</span>
                                    <span className="font-medium">{user.nom_entreprise}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">ID :</span>
                                <span className="font-mono text-sm">#{user.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation */}
                    <div>
                        <Label htmlFor="confirm" className="text-sm font-medium text-gray-900">
                            Pour confirmer la suppression, tapez exactement :
                        </Label>
                        <div className="mt-1 mb-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                {expectedConfirmText}
                            </code>
                        </div>
                        <Input
                            id="confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={expectedConfirmText}
                            className={`font-mono ${
                                confirmText && !isConfirmValid 
                                    ? 'border-red-300 focus:border-red-500' 
                                    : isConfirmValid 
                                    ? 'border-green-300 focus:border-green-500' 
                                    : ''
                            }`}
                        />
                        {confirmText && !isConfirmValid && (
                            <p className="text-xs text-red-600 mt-1">
                                Le texte ne correspond pas exactement
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete} 
                            disabled={!isConfirmValid || deleting}
                        >
                            {deleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Suppression...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer définitivement
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteUserModal;