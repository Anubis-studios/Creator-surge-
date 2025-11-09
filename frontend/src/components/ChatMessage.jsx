import React from 'react';
import { User } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

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
      <div className={`flex-1 ${
        isUser 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
          : 'bg-slate-100 text-slate-900'
      } rounded-2xl p-4 shadow-sm max-w-3xl`}>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-2 ${
          isUser ? 'text-purple-100' : 'text-slate-500'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
