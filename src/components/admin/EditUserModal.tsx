import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Building,
    Save,
    X,
    AlertTriangle
} from "lucide-react";
import { apiClient } from "@/services/api";
import { toast } from "sonner";

interface EditUserModalProps {
    userId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
}

interface EditUserData {
    // Informations utilisateur
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    statut: string;
    notes_admin: string;
    
    // Informations entreprise (pour fournisseurs)
    entreprise?: {
        nom_entreprise: string;
        description: string;
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
        nom_banque: string;
        iban: string;
        nom_titulaire_compte: string;
        bic_swift: string;
        annee_creation: number;
        nombre_employes: number;
        capacite_production: string;
        certifications: string;
    };
}

const EditUserModal = ({ userId, isOpen, onClose, onUserUpdated }: EditUserModalProps) => {
    const [userData, setUserData] = useState<EditUserData | null>(null);
    const [originalData, setOriginalData] = useState<EditUserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState<number>(1);

    useEffect(() => {
        if (userId && isOpen) {
            fetchUserData();
        }
    }, [userId, isOpen]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/admin/users/${userId}`);
            
            const formattedData: EditUserData = {
                nom: response.nom || '',
                prenom: response.prenom || '',
                email: response.email || '',
                telephone: response.telephone || '',
                statut: response.statut || 'actif',
                notes_admin: response.notes_admin || '',
                ...(response.role_id === 2 && response.entreprise && {
                    entreprise: {
                        nom_entreprise: response.entreprise.nom_entreprise || '',
                        description: response.entreprise.description || '',
                        telephone_professionnel: response.entreprise.telephone_professionnel || '',
                        adresse_ligne1: response.entreprise.adresse_ligne1 || '',
                        adresse_ligne2: response.entreprise.adresse_ligne2 || '',
                        ville: response.entreprise.ville || '',
                        code_postal: response.entreprise.code_postal || '',
                        pays: response.entreprise.pays || 'Gabon',
                        site_web: response.entreprise.site_web || '',
                        numero_siret: response.entreprise.numero_siret || '',
                        numero_registre_commerce: response.entreprise.numero_registre_commerce || '',
                        numero_tva: response.entreprise.numero_tva || '',
                        nom_banque: response.entreprise.nom_banque || '',
                        iban: response.entreprise.iban || '',
                        nom_titulaire_compte: response.entreprise.nom_titulaire_compte || '',
                        bic_swift: response.entreprise.bic_swift || '',
                        annee_creation: response.entreprise.annee_creation || new Date().getFullYear(),
                        nombre_employes: response.entreprise.nombre_employes || 0,
                        capacite_production: response.entreprise.capacite_production || '',
                        certifications: response.entreprise.certifications || '',
                    }
                })
            };
            
            setUserData(formattedData);
            setOriginalData(JSON.parse(JSON.stringify(formattedData)));
            setUserRole(response.role_id);
        } catch (error) {
            console.error('Erreur chargement données utilisateur:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userData || !userId) return;

        try {
            setSaving(true);
            await apiClient.put(`/admin/users/${userId}`, userData);
            toast.success('Utilisateur modifié avec succès');
            onUserUpdated();
            onClose();
        } catch (error) {
            console.error('Erreur modification utilisateur:', error);
            toast.error('Erreur lors de la modification');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        if (!userData) return;
        
        setUserData(prev => ({
            ...prev!,
            [field]: value
        }));
    };

    const handleEntrepriseChange = (field: string, value: string | number) => {
        if (!userData || !userData.entreprise) return;
        
        setUserData(prev => ({
            ...prev!,
            entreprise: {
                ...prev!.entreprise!,
                [field]: value
            }
        }));
    };

    const getRoleBadge = (roleId: number) => {
        switch (roleId) {
            case 1:
                return <Badge className="bg-blue-100 text-blue-800"><User className="w-3 h-3 mr-1" />Acheteur</Badge>;
            case 2:
                return <Badge className="bg-green-100 text-green-800"><Building className="w-3 h-3 mr-1" />Fournisseur</Badge>;
            case 3:
                return <Badge className="bg-purple-100 text-purple-800">Administrateur</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
        }
    };

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chargement des données utilisateur</DialogTitle>
                        <DialogDescription>Récupération des informations pour modification...</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des données...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!userData) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold">
                                Modifier l'utilisateur #{userId}
                            </DialogTitle>
                            <DialogDescription>
                                Modification des informations utilisateur et entreprise
                            </DialogDescription>
                            <div className="mt-2">
                                {getRoleBadge(userRole)}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Informations personnelles */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informations personnelles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="prenom">Prénom *</Label>
                                    <Input
                                        id="prenom"
                                        value={userData.prenom}
                                        onChange={(e) => handleInputChange('prenom', e.target.value)}
                                        placeholder="Prénom"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="nom">Nom *</Label>
                                    <Input
                                        id="nom"
                                        value={userData.nom}
                                        onChange={(e) => handleInputChange('nom', e.target.value)}
                                        placeholder="Nom"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={userData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="email@exemple.com"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="telephone">Téléphone</Label>
                                    <Input
                                        id="telephone"
                                        value={userData.telephone}
                                        onChange={(e) => handleInputChange('telephone', e.target.value)}
                                        placeholder="+241 XX XX XX XX"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="statut">Statut</Label>
                                    <Select value={userData.statut} onValueChange={(value) => handleInputChange('statut', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="actif">Actif</SelectItem>
                                            <SelectItem value="suspendu">Suspendu</SelectItem>
                                            <SelectItem value="inactif">Inactif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations entreprise (pour fournisseurs) */}
                    {userRole === 2 && userData.entreprise && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Informations entreprise
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Informations générales */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Informations générales</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
                                                <Input
                                                    id="nom_entreprise"
                                                    value={userData.entreprise.nom_entreprise}
                                                    onChange={(e) => handleEntrepriseChange('nom_entreprise', e.target.value)}
                                                    placeholder="Nom de l'entreprise"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="telephone_professionnel">Téléphone professionnel</Label>
                                                <Input
                                                    id="telephone_professionnel"
                                                    value={userData.entreprise.telephone_professionnel}
                                                    onChange={(e) => handleEntrepriseChange('telephone_professionnel', e.target.value)}
                                                    placeholder="+241 XX XX XX XX"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="site_web">Site web</Label>
                                                <Input
                                                    id="site_web"
                                                    value={userData.entreprise.site_web}
                                                    onChange={(e) => handleEntrepriseChange('site_web', e.target.value)}
                                                    placeholder="https://www.exemple.com"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="annee_creation">Année de création</Label>
                                                <Input
                                                    id="annee_creation"
                                                    type="number"
                                                    value={userData.entreprise.annee_creation}
                                                    onChange={(e) => handleEntrepriseChange('annee_creation', parseInt(e.target.value))}
                                                    placeholder="2020"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="nombre_employes">Nombre d'employés</Label>
                                                <Input
                                                    id="nombre_employes"
                                                    type="number"
                                                    value={userData.entreprise.nombre_employes}
                                                    onChange={(e) => handleEntrepriseChange('nombre_employes', parseInt(e.target.value))}
                                                    placeholder="10"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={userData.entreprise.description}
                                                onChange={(e) => handleEntrepriseChange('description', e.target.value)}
                                                placeholder="Description de l'entreprise..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    {/* Adresse */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Adresse</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <Label htmlFor="adresse_ligne1">Adresse ligne 1</Label>
                                                <Input
                                                    id="adresse_ligne1"
                                                    value={userData.entreprise.adresse_ligne1}
                                                    onChange={(e) => handleEntrepriseChange('adresse_ligne1', e.target.value)}
                                                    placeholder="Numéro et nom de rue"
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-2">
                                                <Label htmlFor="adresse_ligne2">Adresse ligne 2</Label>
                                                <Input
                                                    id="adresse_ligne2"
                                                    value={userData.entreprise.adresse_ligne2}
                                                    onChange={(e) => handleEntrepriseChange('adresse_ligne2', e.target.value)}
                                                    placeholder="Complément d'adresse"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="ville">Ville</Label>
                                                <Input
                                                    id="ville"
                                                    value={userData.entreprise.ville}
                                                    onChange={(e) => handleEntrepriseChange('ville', e.target.value)}
                                                    placeholder="Libreville"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="code_postal">Code postal</Label>
                                                <Input
                                                    id="code_postal"
                                                    value={userData.entreprise.code_postal}
                                                    onChange={(e) => handleEntrepriseChange('code_postal', e.target.value)}
                                                    placeholder="BP 1234"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="pays">Pays</Label>
                                                <Input
                                                    id="pays"
                                                    value={userData.entreprise.pays}
                                                    onChange={(e) => handleEntrepriseChange('pays', e.target.value)}
                                                    placeholder="Gabon"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informations légales */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Informations légales</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="numero_siret">Numéro SIRET</Label>
                                                <Input
                                                    id="numero_siret"
                                                    value={userData.entreprise.numero_siret}
                                                    onChange={(e) => handleEntrepriseChange('numero_siret', e.target.value)}
                                                    placeholder="12345678901234"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="numero_registre_commerce">Registre du commerce</Label>
                                                <Input
                                                    id="numero_registre_commerce"
                                                    value={userData.entreprise.numero_registre_commerce}
                                                    onChange={(e) => handleEntrepriseChange('numero_registre_commerce', e.target.value)}
                                                    placeholder="RC123456"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="numero_tva">Numéro TVA</Label>
                                                <Input
                                                    id="numero_tva"
                                                    value={userData.entreprise.numero_tva}
                                                    onChange={(e) => handleEntrepriseChange('numero_tva', e.target.value)}
                                                    placeholder="GA123456789"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informations bancaires */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Informations bancaires</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="nom_banque">Nom de la banque</Label>
                                                <Input
                                                    id="nom_banque"
                                                    value={userData.entreprise.nom_banque}
                                                    onChange={(e) => handleEntrepriseChange('nom_banque', e.target.value)}
                                                    placeholder="Banque Centrale du Gabon"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="nom_titulaire_compte">Nom du titulaire</Label>
                                                <Input
                                                    id="nom_titulaire_compte"
                                                    value={userData.entreprise.nom_titulaire_compte}
                                                    onChange={(e) => handleEntrepriseChange('nom_titulaire_compte', e.target.value)}
                                                    placeholder="Nom du titulaire du compte"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="iban">IBAN</Label>
                                                <Input
                                                    id="iban"
                                                    value={userData.entreprise.iban}
                                                    onChange={(e) => handleEntrepriseChange('iban', e.target.value)}
                                                    placeholder="GA76 1234 5678 9012 3456 7890 123"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="bic_swift">Code BIC/SWIFT</Label>
                                                <Input
                                                    id="bic_swift"
                                                    value={userData.entreprise.bic_swift}
                                                    onChange={(e) => handleEntrepriseChange('bic_swift', e.target.value)}
                                                    placeholder="BCGAGAXX"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes administratives */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Notes administratives
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={userData.notes_admin}
                                onChange={(e) => handleInputChange('notes_admin', e.target.value)}
                                placeholder="Notes internes pour l'administration..."
                                rows={4}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserModal;