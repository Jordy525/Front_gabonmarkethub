import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { getImageUrl } from '../../config/constants';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface AdminProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoUpdate: (photoPath: string) => void;
  onPhotoDelete: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AdminProfilePhotoUpload: React.FC<AdminProfilePhotoUploadProps> = ({
  currentPhoto,
  onPhotoUpdate,
  onPhotoDelete,
  size = 'xl',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  // Effacer les messages après 3 secondes
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WEBP.');
      return;
    }

    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux. Taille maximale : 5MB.');
      return;
    }

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload du fichier
    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile-photo/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }

      setSuccess('Photo de profil mise à jour avec succès !');
      onPhotoUpdate(result.data.photo_profil);
      setPreview(null);

    } catch (error) {
      console.error('Erreur upload photo:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentPhoto) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile-photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      setSuccess('Photo de profil supprimée avec succès !');
      onPhotoDelete();

    } catch (error) {
      console.error('Erreur suppression photo:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayPhoto = preview || currentPhoto;

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <Shield className="w-5 h-5 mr-2" />
          Photo de profil administrateur
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone de photo */}
        <div className="flex justify-center">
          <div className="relative group">
            <div
              className={`
                ${sizeClasses[size]} 
                rounded-full border-2 border-red-200 
                overflow-hidden cursor-pointer
                transition-all duration-200
                hover:border-red-500 hover:shadow-lg
                ${isUploading ? 'opacity-50' : ''}
              `}
              onClick={handleClick}
            >
              {displayPhoto ? (
                <img
                  src={getImageUrl(displayPhoto)}
                  alt="Photo de profil admin"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-red-100 flex items-center justify-center">
                  <Shield className={`${iconSizes[size]} text-red-600`} />
                </div>
              )}

              {/* Overlay au survol */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <Camera className={`${iconSizes[size]} text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
              </div>

              {/* Indicateur de chargement */}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Bouton de suppression */}
            {currentPhoto && !isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                title="Supprimer la photo"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Boutons d'action */}
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleClick}
            disabled={isUploading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Upload en cours...' : 'Changer la photo'}
          </Button>

          {currentPhoto && (
            <Button
              variant="outline"
              onClick={handleDeletePhoto}
              disabled={isUploading}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Supprimer la photo
            </Button>
          )}
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Informations */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Formats acceptés : JPEG, PNG, GIF, WEBP</p>
          <p>Taille maximale : 5MB</p>
          <p className="text-red-600 font-medium">Réservé aux administrateurs</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminProfilePhotoUpload;
