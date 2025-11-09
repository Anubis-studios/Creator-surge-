import React from 'react';
import { MessageSquare } from 'lucide-react';

const ConversationList = ({ conversations, activeConversationId, onSelectConversation }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="p-2 space-y-1">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full text-left p-3 rounded-lg transition-all ${
            activeConversationId === conversation.id
              ? 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200'
              : 'hover:bg-slate-50 border border-transparent'
          }`}
        >
          <div className="flex items-start gap-3">
            <MessageSquare className={`w-5 h-5 mt-1 flex-shrink-0 ${
              activeConversationId === conversation.id
                ? 'text-purple-600'
                : 'text-slate-400'
            }`} />
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-sm mb-1 truncate ${
                activeConversationId === conversation.id
                  ? 'text-purple-900'
                  : 'text-slate-900'
              }`}>
                {conversation.title}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {conversation.preview}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {formatTimestamp(conversation.timestamp)}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConversationList;
