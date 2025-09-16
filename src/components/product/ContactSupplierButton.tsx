import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { conversationService } from '@/services/conversationService';
import { toast } from 'sonner';

interface ContactSupplierButtonProps {
  fournisseurId: number;
  produitId: number;
  produitNom?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

export const ContactSupplierButton: React.FC<ContactSupplierButtonProps> = ({
  fournisseurId,
  produitId,
  produitNom,
  className,
  variant = 'default',
  size = 'default'
}) => {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);

  const handleContactSupplier = async () => {
    // Vérifier que l'utilisateur est connecté
    if (!currentUser) {
      toast.error('Vous devez être connecté pour contacter un fournisseur');
      navigate('/login');
      return;
    }

    // Vérifier que l'utilisateur est un acheteur
    if (currentUser.role_id !== 1) {
      toast.error('Seuls les acheteurs peuvent contacter les fournisseurs');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔄 Ouverture conversation depuis produit:', {
        fournisseurId,
        produitId,
        produitNom,
        acheteur: currentUser.nom
      });

      // Rediriger directement vers le chat avec les paramètres
      const params = new URLSearchParams({
        supplier: fournisseurId.toString(),
        product: produitId.toString(),
        ...(produitNom && { productName: produitNom })
      });
      
      navigate(`/messages?${params.toString()}`);
      
    } catch (error) {
      console.error('❌ Erreur ouverture conversation:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          toast.error('Fournisseur non trouvé');
        } else if (error.message.includes('403')) {
          toast.error('Vous n\'êtes pas autorisé à contacter ce fournisseur');
        } else {
          toast.error('Erreur lors de l\'ouverture de la conversation');
        }
      } else {
        toast.error('Erreur inattendue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleContactSupplier}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MessageSquare className="w-4 h-4 mr-2" />
      )}
      {loading ? 'Ouverture...' : 'Contacter le fournisseur'}
    </Button>
  );
};

export default ContactSupplierButton;