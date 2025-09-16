import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface MessagePaginationProps {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  messagesPerPage: number;
  onPageChange: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export const MessagePagination: React.FC<MessagePaginationProps> = ({
  currentPage,
  totalPages,
  totalMessages,
  messagesPerPage,
  onPageChange,
  onLoadMore,
  hasMore = false,
  isLoading = false
}) => {
  const startMessage = (currentPage - 1) * messagesPerPage + 1;
  const endMessage = Math.min(currentPage * messagesPerPage, totalMessages);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLoadMore = () => {
    if (onLoadMore && hasMore && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-4 border-t border-gray-200">
      {/* Informations sur les messages */}
      <div className="text-sm text-gray-600">
        Affichage de {startMessage} à {endMessage} sur {totalMessages} messages
      </div>

      {/* Bouton "Voir anciens messages" en haut */}
      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadMore}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ChevronUp className="w-4 h-4" />
          {isLoading ? 'Chargement...' : 'Voir anciens messages'}
        </Button>
      )}

      {/* Pagination classique */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
          Chargement des messages...
        </div>
      )}
    </div>
  );
};




