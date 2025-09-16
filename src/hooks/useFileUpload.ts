import { useState, useCallback } from 'react';
import { messageService } from '../services/messageService';
import type { FileUploadRequest, FileUploadResponse } from '../types/api';

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UseFileUploadReturn {
  uploads: UploadProgress[];
  isUploading: boolean;
  uploadFile: (file: File, conversationId: number, messageId?: number) => Promise<FileUploadResponse>;
  uploadFiles: (files: File[], conversationId: number, messageId?: number) => Promise<FileUploadResponse[]>;
  removeUpload: (fileName: string) => void;
  clearUploads: () => void;
  validateFile: (file: File) => { valid: boolean; error?: string };
}

// Configuration des types de fichiers autorisés et tailles maximales
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  archives: ['application/zip', 'application/x-rar-compressed'],
  all: [] as string[] // Sera rempli automatiquement
};

// Remplir la liste de tous les types autorisés
ALLOWED_FILE_TYPES.all = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.archives
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_UPLOAD = 5;

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  // Calculer si un upload est en cours
  const isUploading = uploads.some(upload => upload.status === 'uploading');

  // Valider un fichier
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Le fichier "${file.name}" est trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    // Vérifier le type
    if (!ALLOWED_FILE_TYPES.all.includes(file.type)) {
      return {
        valid: false,
        error: `Le type de fichier "${file.type}" n'est pas autorisé pour "${file.name}"`
      };
    }

    return { valid: true };
  }, []);

  // Ajouter ou mettre à jour un upload dans la liste
  const updateUpload = useCallback((fileName: string, updates: Partial<UploadProgress>) => {
    setUploads(prev => {
      const existingIndex = prev.findIndex(upload => upload.fileName === fileName);
      if (existingIndex >= 0) {
        // Mettre à jour l'upload existant
        const newUploads = [...prev];
        newUploads[existingIndex] = { ...newUploads[existingIndex], ...updates };
        return newUploads;
      } else {
        // Ajouter un nouvel upload
        return [...prev, { fileName, progress: 0, status: 'pending', ...updates }];
      }
    });
  }, []);

  // Uploader un seul fichier
  const uploadFile = useCallback(async (
    file: File, 
    conversationId: number, 
    messageId?: number
  ): Promise<FileUploadResponse> => {
    // Valider le fichier
    const validation = validateFile(file);
    if (!validation.valid) {
      updateUpload(file.name, { status: 'error', error: validation.error });
      throw new Error(validation.error);
    }

    try {
      // Initialiser le suivi de l'upload
      updateUpload(file.name, { status: 'uploading', progress: 0 });

      // Simuler le progrès d'upload (en mode développement)
      const progressInterval = setInterval(() => {
        setUploads(prev => {
          const upload = prev.find(u => u.fileName === file.name);
          if (upload && upload.status === 'uploading' && upload.progress < 90) {
            updateUpload(file.name, { progress: upload.progress + 10 });
          }
          return prev;
        });
      }, 200);

      // Effectuer l'upload
      const uploadRequest: FileUploadRequest = {
        file,
        conversation_id: conversationId,
        message_id: messageId
      };

      const response = await messageService.uploadFile(uploadRequest);

      // Nettoyer l'intervalle de progrès
      clearInterval(progressInterval);

      // Marquer comme terminé
      updateUpload(file.name, { status: 'completed', progress: 100 });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
      updateUpload(file.name, { status: 'error', error: errorMessage });
      throw error;
    }
  }, [validateFile, updateUpload]);

  // Uploader plusieurs fichiers
  const uploadFiles = useCallback(async (
    files: File[], 
    conversationId: number, 
    messageId?: number
  ): Promise<FileUploadResponse[]> => {
    // Vérifier le nombre de fichiers
    if (files.length > MAX_FILES_PER_UPLOAD) {
      throw new Error(`Vous ne pouvez uploader que ${MAX_FILES_PER_UPLOAD} fichiers à la fois`);
    }

    // Valider tous les fichiers avant de commencer
    const validationErrors: string[] = [];
    files.forEach(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(validation.error!);
      }
    });

    if (validationErrors.length > 0) {
      throw new Error(`Erreurs de validation:\n${validationErrors.join('\n')}`);
    }

    // Uploader tous les fichiers en parallèle
    const uploadPromises = files.map(file => uploadFile(file, conversationId, messageId));
    
    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      // En cas d'erreur, certains fichiers peuvent avoir été uploadés avec succès
      console.error('Erreur lors de l\'upload de fichiers:', error);
      throw error;
    }
  }, [uploadFile, validateFile]);

  // Supprimer un upload de la liste
  const removeUpload = useCallback((fileName: string) => {
    setUploads(prev => prev.filter(upload => upload.fileName !== fileName));
  }, []);

  // Vider la liste des uploads
  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  return {
    uploads,
    isUploading,
    uploadFile,
    uploadFiles,
    removeUpload,
    clearUploads,
    validateFile
  };
};