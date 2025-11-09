import React from 'react';
import { User, Code, Palette, TrendingUp, Sparkles, Zap } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const getAgentIcon = (agentType) => {
    switch (agentType) {
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'image':
        return <Palette className="w-4 h-4" />;
      case 'strategy':
        return <TrendingUp className="w-4 h-4" />;
      case 'appbuilder':
        return <Zap className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getAgentName = (agentType) => {
    switch (agentType) {
      case 'code':
        return 'Code Agent';
      case 'image':
        return 'Image Agent';
      case 'strategy':
        return 'Strategy Agent';
      case 'appbuilder':
        return 'App Builder';
      default:
        return 'AI Assistant';
    }
  };

  const getAgentColor = (agentType) => {
    switch (agentType) {
      case 'code':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'image':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'strategy':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'appbuilder':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser 
          ? 'bg-slate-200' 
          : 'bg-gradient-to-br from-purple-600 to-blue-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-slate-700" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/20" />
        )}
      </div>
      <div className={`flex-1 max-w-3xl ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        {!isUser && message.agentType && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getAgentColor(message.agentType)}`}>
            {getAgentIcon(message.agentType)}
            {getAgentName(message.agentType)}
          </div>
        )}
        <div className={`${
          isUser 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
            : 'bg-slate-100 text-slate-900'
        } rounded-2xl p-4 shadow-sm w-full`}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <p className={`text-xs mt-2 ${
            isUser ? 'text-purple-100' : 'text-slate-500'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
