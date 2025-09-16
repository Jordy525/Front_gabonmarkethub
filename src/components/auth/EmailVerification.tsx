import { useState, useEffect, useRef } from "react";
import { Mail, ArrowLeft, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/services/api";

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: (userData: any) => void;
  onBack: () => void;
  onResendCode: () => void;
  isResending?: boolean;
}

const EmailVerification = ({
  email,
  onVerificationSuccess,
  onBack,
  onResendCode,
  isResending = false
}: EmailVerificationProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes en secondes
  const [isExpired, setIsExpired] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer pour le code de vérification
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [timeLeft]);

  // Formatage du temps restant
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Gestion de la saisie du code
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Empêcher la saisie de plus d'un caractère
    
    const newCode = code.split('');
    newCode[index] = value;
    const newCodeString = newCode.join('');
    setCode(newCodeString);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Gestion de la suppression
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Veuillez saisir le code complet à 6 chiffres");
      return;
    }

    if (isExpired) {
      toast.error("Le code a expiré. Veuillez en demander un nouveau");
      return;
    }

    setIsLoading(true);
    
    try {
      // Récupérer les données du formulaire depuis le localStorage
      const formData = JSON.parse(localStorage.getItem('registrationData') || '{}');
      
      const response = await apiClient.post('/auth/register/verify-code', {
        email,
        verification_code: code,
        ...formData
      });

      // Nettoyer les données temporaires
      localStorage.removeItem('registrationData');
      
      toast.success("Compte créé avec succès !");
      onVerificationSuccess(response.user);
      
    } catch (error: any) {
      console.error('Erreur vérification:', error);
      toast.error(error.response?.data?.error || "Erreur lors de la vérification du code");
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoyer le code
  const handleResendCode = async () => {
    try {
      await onResendCode();
      setTimeLeft(600); // Reset du timer
      setIsExpired(false);
      setCode(""); // Vider le code
      inputRefs.current[0]?.focus(); // Focus sur le premier champ
      toast.success("Nouveau code envoyé !");
    } catch (error) {
      toast.error("Erreur lors du renvoi du code");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Vérification Email
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Nous avons envoyé un code à 6 chiffres à
        </p>
        <p className="text-gabon-green font-semibold">{email}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Affichage du code de vérification */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Code de vérification
            </label>
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={code[index] || ''}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-gabon-green focus:ring-gabon-green"
                  disabled={isLoading || isExpired}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            {!isExpired ? (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Code valide pendant :</span>
                <span className="font-mono font-bold text-gabon-green">
                  {formatTime(timeLeft)}
                </span>
              </div>
            ) : (
              <div className="text-red-600 text-sm font-medium">
                ⏰ Code expiré
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isLoading || code.length !== 6 || isExpired}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Créer le compte
                </>
              )}
            </Button>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending || isLoading}
                className="flex-1"
              >
                {isResending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Renvoyer
              </Button>
            </div>
          </div>

          {/* Message d'aide */}
          <div className="text-center text-sm text-gray-500">
            <p>Vous n'avez pas reçu le code ?</p>
            <p>Vérifiez vos spams ou demandez un nouveau code</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
