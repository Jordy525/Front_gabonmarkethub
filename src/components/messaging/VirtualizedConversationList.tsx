import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ConversationListItem } from './ConversationListItem';
import type { Conversation } from '@/types/api';

export interface VirtualizedConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: number;
  onSelectConversation: (conversation: Conversation) => void;
  height: number;
  itemHeight?: number;
  className?: string;
}

interface ListItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    conversations: Conversation[];
    selectedConversationId?: number;
    onSelectConversation: (conversation: Conversation) => void;
  };
}

const ListItem: React.FC<ListItemProps> = ({ index, style, data }) => {
  const { conversations, selectedConversationId, onSelectConversation } = data;
  const conversation = conversations[index];

  if (!conversation) {
    return <div style={style} />;
  }

  return (
    <div style={style}>
      <ConversationListItem
        conversation={conversation}
        isSelected={conversation.id === selectedConversationId}
        onSelect={() => onSelectConversation(conversation)}
      />
    </div>
  );
};

export const VirtualizedConversationList: React.FC<VirtualizedConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  height,
  itemHeight = 80,
  className = ''
}) => {
  const itemData = useMemo(() => ({
    conversations,
    selectedConversationId,
    onSelectConversation
  }), [conversations, selectedConversationId, onSelectConversation]);

  const itemCount = conversations.length;

  if (itemCount === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <p>Aucune conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={itemCount}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Pré-rendre 5 éléments en plus pour un scroll fluide
      >
        {ListItem}
      </List>
    </div>
  );
};