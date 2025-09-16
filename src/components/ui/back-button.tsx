import { ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
}

export const BackButton = ({ 
  label = "Retour", 
  fallbackPath = "/", 
  className = "" 
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};