export interface Supplier {
  id: number;
  utilisateur_id: number;
  nom_entreprise: string;
  nom: string;
  prenom: string;
  email: string;
  secteur?: string;
  description?: string;
  statut: string;
  created_at: string;
}
