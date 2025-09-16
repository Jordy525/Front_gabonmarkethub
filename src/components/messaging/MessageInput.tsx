import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  X, 
  Smile,
  Mic,
  MicOff,
  FileText,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useOptimisticMessages } from '@/hooks/useOptimisticMessages';
import type { FileUploadResponse } from '@/types/api';

export interface MessageInputProps {
  onSendMessage?: (content: string, files?: FileUploadResponse[]) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  conversationId: number;
  maxLength?: number;
  className?: string;
  // New props for optimistic updates
  useOptimistic?: boolean;
  onOptimisticUpdate?: (messages: any[]) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Tapez votre message...",
  conversationId,
  maxLength = 2000,
  className = '',
  useOptimistic = true,
  onOptimisticUpdate
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { 
    uploads, 
    isUploading, 
    uploadFiles, 
    removeUpload, 
    clearUploads,
    validateFile 
  } = useFileUpload();

  // Use optimistic messages hook if enabled
  const optimisticMessages = useOptimisticMessages(
    conversationId,
    { maxRetries: 3, retryDelay: 1000 }
  );

  // Notify parent of optimistic updates
  useEffect(() => {
    if (useOptimistic && onOptimisticUpdate) {
      onOptimisticUpdate(optimisticMessages.messages);
    }
  }, [optimisticMessages.messages, useOptimistic, onOptimisticUpdate]);

  // Gérer la frappe avec debouncing
  const handleTyping = useCallback((typing: boolean) => {
    if (onTyping && typing !== isTyping) {
      setIsTyping(typing);
      onTyping(typing);
      
      if (typing) {
        // Arrêter la frappe après 3 secondes d'inactivité
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTyping(false);
        }, 3000);
      }
    }
  }, [onTyping, isTyping]);

  // Nettoyer le timeout lors du démontage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Gérer les changements de texte
  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);
    
    // Déclencher l'indicateur de frappe
    if (value.trim() && !isTyping) {
      handleTyping(true);
    } else if (!value.trim() && isTyping) {
      handleTyping(false);
    }
    
    // Auto-resize du textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [isTyping, handleTyping]);

  // Gérer l'envoi du message avec optimistic updates
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && selectedFiles.length === 0) {
      return;
    }

    if (trimmedMessage.length > maxLength) {
      return;
    }

    setSendError(null);

    try {
      // Uploader les fichiers d'abord si nécessaire
      let uploadedFiles: FileUploadResponse[] = [];
      if (selectedFiles.length > 0) {
        uploadedFiles = await uploadFiles(selectedFiles, conversationId);
      }
      
      if (useOptimistic) {
        // Use optimistic updates
        await optimisticMessages.sendMessage(trimmedMessage, 'texte', {
          files: uploadedFiles
        });
      } else {
        // Fallback to traditional method
        if (onSendMessage) {
          await onSendMessage(trimmedMessage, uploadedFiles);
        }
      }
      
      // Réinitialiser l'état seulement en cas de succès
      setMessage('');
      setSelectedFiles([]);
      clearUploads();
      handleTyping(false);
      
      // Réinitialiser la hauteur du textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Remettre le focus sur le textarea
      textareaRef.current?.focus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message';
      setSendError(errorMessage);
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  }, [
    message, 
    selectedFiles, 
    maxLength, 
    conversationId, 
    uploadFiles, 
    useOptimistic,
    optimisticMessages,
    onSendMessage,
    clearUploads, 
    handleTyping
  ]);

  // Gérer les raccourcis clavier
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Valider les fichiers
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error!);
      }
    });
    
    if (errors.length > 0) {
      // Afficher les erreurs (vous pouvez utiliser un toast ici)
      console.error('Erreurs de validation:', errors);
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateFile]);

  // Gérer le drag & drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    
    // Valider et ajouter les fichiers
    const validFiles: File[] = [];
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      }
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [validateFile]);

  // Supprimer un fichier sélectionné
  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Formater la taille de fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Obtenir l'icône de fichier
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const isSending = useOptimistic ? optimisticMessages.sendingCount > 0 : false;
  const hasErrors = useOptimistic ? optimisticMessages.errorCount > 0 : false;
  const canSend = (message.trim() || selectedFiles.length > 0) && !isSending && !isUploading && !disabled;
  const characterCount = message.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <TooltipProvider>
      <div className={`border-t bg-white ${className}`}>
        {/* Error Alert */}
        {(sendError || hasErrors) && (
          <div className="p-3 border-b bg-red-50">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {sendError || `${optimisticMessages.errorCount} message(s) en erreur`}
                </span>
                <div className="flex items-center space-x-2">
                  {hasErrors && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => optimisticMessages.clearErrors()}
                      className="h-6 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </Button>
                  )}
                  {sendError && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSendError(null)}
                      className="h-6 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Sending Status */}
        {isSending && (
          <div className="p-2 border-b bg-blue-50">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700"></div>
              <span>Envoi de {optimisticMessages.sendingCount} message(s)...</span>
            </div>
          </div>
        )}
        {/* Zone de fichiers sélectionnés */}
        {selectedFiles.length > 0 && (
          <div className="p-3 border-b bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white rounded-lg p-2 border"
                >
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSelectedFile(index)}
                    className="p-1 h-auto"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone d'upload en cours */}
        {uploads.length > 0 && (
          <div className="p-3 border-b bg-blue-50">
            {uploads.map((upload, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{upload.fileName}</span>
                  <div className="flex items-center space-x-2">
                    {upload.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {upload.progress}%
                    </span>
                  </div>
                </div>
                <Progress value={upload.progress} className="h-1" />
                {upload.error && (
                  <div className="text-xs text-red-600 mt-1">{upload.error}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Zone de saisie principale */}
        <div 
          className={`p-4 ${dragOver ? 'bg-blue-50 border-blue-200' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {dragOver && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-10 border-2 border-dashed border-blue-300 rounded-lg">
              <div className="text-center">
                <Paperclip className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-blue-700 font-medium">Déposez vos fichiers ici</p>
              </div>
            </div>
          )}

          <div className="flex items-end space-x-2">
            {/* Boutons d'actions à gauche */}
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="p-2"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Joindre un fichier</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = 'image/*';
                        fileInputRef.current.click();
                      }
                    }}
                    disabled={disabled}
                    className="p-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Joindre une image</TooltipContent>
              </Tooltip>
            </div>

            {/* Zone de saisie */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isSending}
                className={`
                  min-h-[40px] max-h-[120px] resize-none pr-16
                  ${isOverLimit ? 'border-red-300 focus:border-red-500' : ''}
                `}
                rows={1}
              />
              
              {/* Compteur de caractères */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                <span className={isOverLimit ? 'text-red-500' : ''}>
                  {characterCount}
                </span>
                /{maxLength}
              </div>
            </div>

            {/* Bouton d'envoi */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSendMessage}
                  disabled={!canSend || isOverLimit}
                  size="sm"
                  className="p-2 min-w-[40px]"
                >
                  {isSending || isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isOverLimit 
                  ? 'Message trop long' 
                  : 'Envoyer le message (Entrée)'
                }
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Input de fichier caché */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
          />
        </div>

        {/* Indicateur de frappe */}
        {isTyping && (
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
            Vous êtes en train d'écrire...
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};