import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, User, AlertCircle, CheckCircle } from 'lucide-react';
import { getImageUrl } from '../../config/constants';

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoUpdate: (photoPath: string) => void;
  onPhotoDelete: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhoto,
  onPhotoUpdate,
  onPhotoDelete,
  size = 'md',
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
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
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
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Zone de photo */}
      <div className="relative group">
        <div
          className={`
            ${sizeClasses[size]} 
            rounded-full border-2 border-gray-300 
            overflow-hidden cursor-pointer
            transition-all duration-200
            hover:border-blue-500 hover:shadow-lg
            ${isUploading ? 'opacity-50' : ''}
          `}
          onClick={handleClick}
        >
          {displayPhoto ? (
            <img
              src={getImageUrl(displayPhoto)}
              alt="Photo de profil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <User className={`${iconSizes[size]} text-gray-400`} />
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

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Bouton d'upload */}
      <button
        onClick={handleClick}
        disabled={isUploading}
        className={`
          flex items-center space-x-2 px-4 py-2 
          bg-blue-500 text-white rounded-lg
          hover:bg-blue-600 disabled:opacity-50
          transition-colors duration-200
          ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Upload className="w-4 h-4" />
        <span>{isUploading ? 'Upload en cours...' : 'Changer la photo'}</span>
      </button>

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
      <div className="text-xs text-gray-500 text-center max-w-xs">
        <p>Formats acceptés : JPEG, PNG, GIF, WEBP</p>
        <p>Taille maximale : 5MB</p>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
