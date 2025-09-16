import React from 'react';
import { Info, MessageCircle, Users, CheckCircle } from 'lucide-react';
import { useMessagingRules } from '@/hooks/useMessagingRules';

interface MessagingRulesInfoProps {
  className?: string;
  compact?: boolean;
}

export const MessagingRulesInfo: React.FC<MessagingRulesInfoProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const rules = useMessagingRules();

  if (rules.userRole === 'unknown') return null;

  const getRoleInfo = () => {
    switch (rules.userRole) {
      case 'buyer':
        return {
          title: 'Acheteur',
          icon: <Users className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          description: compact 
            ? 'Vous pouvez initier des conversations avec les fournisseurs.'
            : 'En tant qu\'acheteur, vous pouvez initier des conversations avec tous les fournisseurs. Une fois le contact établi, la conversation devient bidirectionnelle.',
          permissions: [
            'Initier des conversations',
            'Contacter les fournisseurs',
            'Répondre aux messages'
          ]
        };
      
      case 'supplier':
        return {
          title: 'Fournisseur',
          icon: <MessageCircle className="w-5 h-5 text-amber-600" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          description: compact
            ? 'Vous pouvez répondre aux acheteurs qui vous contactent.'
            : 'En tant que fournisseur, vous pouvez répondre aux acheteurs qui vous ont contacté en premier. Vous ne pouvez pas initier de nouvelles conversations.',
          permissions: [
            'Répondre aux acheteurs',
            'Voir les conversations existantes'
          ]
        };
      
      case 'admin':
        return {
          title: 'Administrateur',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          description: 'Accès complet à toutes les fonctionnalités de messagerie.',
          permissions: [
            'Accès complet',
            'Modération des conversations'
          ]
        };
      
      default:
        return null;
    }
  };

  const roleInfo = getRoleInfo();
  if (!roleInfo) return null;

  if (compact) {
    return (
      <div className={`${roleInfo.bgColor} ${roleInfo.borderColor} border rounded-lg p-3 ${className}`}>
        <div className="flex items-center">
          {roleInfo.icon}
          <div className="ml-3">
            <p className={`text-sm ${roleInfo.textColor}`}>
              <strong>{roleInfo.title} :</strong> {roleInfo.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${roleInfo.bgColor} ${roleInfo.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        {roleInfo.icon}
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${roleInfo.textColor}`}>
            Messagerie {roleInfo.title}
          </h4>
          <p className={`text-sm ${roleInfo.textColor} mt-1 opacity-90`}>
            {roleInfo.description}
          </p>
          
          <div className="mt-3">
            <h5 className={`text-xs font-medium ${roleInfo.textColor} mb-2`}>
              Vos permissions :
            </h5>
            <ul className="space-y-1">
              {roleInfo.permissions.map((permission, index) => (
                <li key={index} className={`text-xs ${roleInfo.textColor} flex items-center`}>
                  <CheckCircle className="w-3 h-3 mr-2 opacity-60" />
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};