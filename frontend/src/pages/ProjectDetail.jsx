import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft, Send, Code2, Rocket, Users, Activity, 
  ExternalLink, Download, Copy, Check
} from 'lucide-react';
import { projectsAPI, chatsAPI, deploymentsAPI, collaborationAPI } from '../services/devforge-api';
import { useToast } from '../hooks/use-toast';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [deployments, setDeployments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      const [projectData, chatsData, deploymentsData, activitiesData, collaboratorsData] = await Promise.all([
        projectsAPI.getOne(projectId),
        chatsAPI.getChats(projectId),
        deploymentsAPI.getDeployments(projectId),
        collaborationAPI.getActivities(projectId),
        collaborationAPI.getCollaborators(projectId)
      ]);
      
      setProject(projectData);
      setChats(chatsData);
      setDeployments(deploymentsData);
      setActivities(activitiesData);
      setCollaborators(collaboratorsData);
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setIsSending(true);
      const msg = message;
      setMessage('');
      
      const response = await chatsAPI.sendMessage(projectId, msg);
      setChats([...chats, { role: 'user', content: msg }, response]);
      
      // Reload activities
      const activitiesData = await collaborationAPI.getActivities(projectId);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeploy = async () => {
    try {
      await deploymentsAPI.deploy(projectId);
      toast({
        title: "Success",
        description: "Project deployed successfully"
      });
      loadProjectData();
    } catch (error) {
      console.error('Error deploying:', error);
      toast({
        title: "Error",
        description: "Failed to deploy project",
        variant: "destructive"
      });
    }
  };

  const copyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center">
        <div>Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0f0f10] text-white flex items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <p className="text-sm text-gray-400">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {project.deploymentUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(project.deploymentUrl, '_blank')}
                className="border-white/10 text-white hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Live
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleDeploy}
              className="bg-green-600 hover:bg-green-700"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Deploy
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="bg-white/5 border-white/10 mb-6">
            <TabsTrigger value="chat" className="data-[state=active]:bg-white/10">
              <Code2 className="w-4 h-4 mr-2" />
              AI Builder
            </TabsTrigger>
            <TabsTrigger value="deployments" className="data-[state=active]:bg-white/10">
              <Rocket className="w-4 h-4 mr-2" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="data-[state=active]:bg-white/10">
              <Users className="w-4 h-4 mr-2" />
              Collaborate
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/10">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* AI Builder Tab */}
          <TabsContent value="chat" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Chat Panel */}
              <Card className="bg-white/5 border-white/10 flex flex-col h-[calc(100vh-280px)]">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-gray-400">Describe what you want to build</p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chats.map((chat, index) => (
                      <div
                        key={index}
                        className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            chat.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{chat.content}</p>
                          {chat.codeGenerated && chat.codeGenerated.files && chat.codeGenerated.files.length > 0 && (
                            <div className="mt-2 text-xs text-green-400">
                              ✓ Generated {chat.codeGenerated.files.length} file(s)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isSending && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Describe your feature..."
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isSending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Code Preview Panel */}
              <Card className="bg-white/5 border-white/10 h-[calc(100vh-280px)] flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold">Generated Code</h3>
                  <p className="text-xs text-gray-400">AI-generated files will appear here</p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  {chats.filter(c => c.codeGenerated?.files?.length > 0).length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                      <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No code generated yet</p>
                      <p className="text-sm mt-2">Start chatting with AI to generate code</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chats.filter(c => c.codeGenerated?.files?.length > 0).map((chat, chatIdx) => (
                        <div key={chatIdx}>
                          {chat.codeGenerated.files.map((file, fileIdx) => (
                            <div key={fileIdx} className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-mono text-blue-400">{file.path}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyCode(file.content, `${chatIdx}-${fileIdx}`)}
                                  className="h-7"
                                >
                                  {copiedCode === `${chatIdx}-${fileIdx}` ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                              <pre className="bg-black/50 p-3 rounded text-xs overflow-x-auto">
                                <code>{file.content}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          {/* Deployments Tab */}
          <TabsContent value="deployments">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="font-semibold mb-4">Deployment History</h3>
              {deployments.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No deployments yet</p>
                  <Button onClick={handleDeploy} className="mt-4 bg-green-600 hover:bg-green-700">
                    Deploy Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {deployments.map((deployment) => (
                    <div key={deployment.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium">{deployment.status}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(deployment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {deployment.deployedUrl && (
                        <a
                          href={deployment.deployedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                        >
                          {deployment.deployedUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Collaborate Tab */}
          <TabsContent value="collaborate">
            <Card className="bg-white/5 border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Team Members</h3>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Users className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
              {collaborators.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No collaborators yet</p>
                  <p className="text-sm mt-2">Invite team members to collaborate</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {collaborators.map((collab) => (
                    <div key={collab.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{collab.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{collab.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="font-semibold mb-4">Project Activity</h3>
              {activities.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0">
                      <Activity className="w-4 h-4 mt-1 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetail;
