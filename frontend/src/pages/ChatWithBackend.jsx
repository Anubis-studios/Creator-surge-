import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Sparkles, Send, Plus, Menu, X, Home, Code, Palette, TrendingUp, Zap } from 'lucide-react';
import { conversationAPI, chatAPI } from '../services/api';
import ChatMessage from '../components/ChatMessage';
import ConversationList from '../components/ConversationList';
import { useToast } from '../hooks/use-toast';

const ChatWithBackend = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null); // null = auto-detect
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const agents = [
    { type: null, name: 'Auto Detect', icon: Sparkles, color: 'purple' },
    { type: 'text', name: 'Text', icon: Sparkles, color: 'purple' },
    { type: 'code', name: 'Code', icon: Code, color: 'green' },
    { type: 'appbuilder', name: 'App Builder', icon: Zap, color: 'orange' },
    { type: 'strategy', name: 'Strategy', icon: TrendingUp, color: 'blue' },
    { type: 'image', name: 'Image', icon: Palette, color: 'pink' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await conversationAPI.getAll();
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await conversationAPI.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeConversationId) return;

    const messageText = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage(
        activeConversationId, 
        messageText,
        selectedAgent
      );

      // Add both messages to state
      setMessages(prev => [...prev, response.userMessage, response.aiMessage]);
      
      // Update conversation list
      await loadConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newConv = await conversationAPI.create('New Conversation');
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

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
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : (
            <ConversationList 
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
            />
          )}
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
          <div className="flex items-center justify-between">
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
                <p className="text-sm text-slate-500">Multi-Agent AI System</p>
              </div>
            </div>

            {/* Agent Selector */}
            <div className="flex gap-2">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const isSelected = selectedAgent === agent.type;
                return (
                  <Button
                    key={agent.type || 'auto'}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAgent(agent.type)}
                    className={isSelected ? `bg-${agent.color}-600 hover:bg-${agent.color}-700` : ''}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {agent.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Multi-Agent AI System</h3>
                <p className="text-slate-600 mb-6">Choose an agent or let AI auto-detect the best one for your task:</p>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <Code className="w-6 h-6 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-900 mb-1">Code Agent</h4>
                    <p className="text-sm text-green-700">Programming, debugging, code reviews</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <Zap className="w-6 h-6 text-orange-600 mb-2" />
                    <h4 className="font-semibold text-orange-900 mb-1">App Builder</h4>
                    <p className="text-sm text-orange-700">Build complete applications with code</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-900 mb-1">Strategy Agent</h4>
                    <p className="text-sm text-blue-700">Business planning and strategy</p>
                  </div>
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <Palette className="w-6 h-6 text-pink-600 mb-2" />
                    <h4 className="font-semibold text-pink-900 mb-1">Image Agent</h4>
                    <p className="text-sm text-pink-700">Image descriptions and generation</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
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
                disabled={!activeConversationId || isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !activeConversationId || isTyping}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              {selectedAgent ? `Using ${agents.find(a => a.type === selectedAgent)?.name} Agent` : 'AI will auto-detect the best agent'} • Press Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithBackend;
