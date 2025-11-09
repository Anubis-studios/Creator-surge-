import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Sparkles, Send, Plus, Menu, X, Home } from 'lucide-react';
import { mockConversations, getRandomResponse } from '../mock';
import ChatMessage from '../components/ChatMessage';
import ConversationList from '../components/ConversationList';

const Chat = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState(mockConversations[0]?.id || null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    // Add user message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
          preview: inputMessage.substring(0, 50) + '...',
          timestamp: new Date().toISOString()
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: `m${Date.now() + 1}`,
        role: 'assistant',
        content: getRandomResponse() + ' ' + inputMessage.split(' ').slice(0, 10).join(' ') + '. This is a mock response. Backend integration will provide real AI responses.',
        timestamp: new Date().toISOString()
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, aiMessage]
          };
        }
        return conv;
      }));
      setIsTyping(false);
    }, 1500);
  };

  const handleNewChat = () => {
    const newConversation = {
      id: `conv${Date.now()}`,
      title: 'New Conversation',
      preview: 'Start a new conversation...',
      timestamp: new Date().toISOString(),
      messages: []
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'w-80' : 'w-0'
      } transition-all duration-300 overflow-hidden border-r border-slate-200 bg-white flex flex-col`}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900">Creator Surge AI</span>
            </div>
          </div>
          <Button 
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <ConversationList 
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        </ScrollArea>

        <div className="p-4 border-t border-slate-200">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h2 className="font-semibold text-slate-900">
                {activeConversation?.title || 'Select a conversation'}
              </h2>
              <p className="text-sm text-slate-500">AI Assistant</p>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          {activeConversation?.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Start a Conversation</h3>
                <p className="text-slate-600">Ask me anything! I'm here to help with coding, writing, strategy, and more.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {activeConversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex-shrink-0" />
                  <div className="flex-1 bg-slate-100 rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                disabled={!activeConversationId}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !activeConversationId}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
