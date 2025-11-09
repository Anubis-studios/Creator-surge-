import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, FolderCode, Rocket, Clock, ExternalLink } from 'lucide-react';
import { projectsAPI } from '../services/devforge-api';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    projectType: 'fullstack',
    techStack: []
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      await projectsAPI.create(newProject);
      toast({
        title: "Success",
        description: "Project created successfully"
      });
      setIsDialogOpen(false);
      setNewProject({ name: '', description: '', projectType: 'fullstack', techStack: [] });
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  };

  const getProjectTypeIcon = (type) => {
    return <FolderCode className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed': return 'text-green-400';
      case 'active': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">DevForge AI</h1>
            <nav className="flex gap-4 text-sm">
              <button className="text-white font-medium">Projects</button>
              <button className="text-gray-400 hover:text-white">Templates</button>
              <button className="text-gray-400 hover:text-white">Settings</button>
            </nav>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1b] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="My Awesome App"
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="What does this project do?"
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label>Project Type</Label>
                  <Select
                    value={newProject.projectType}
                    onValueChange={(value) => setNewProject({ ...newProject, projectType: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1b] border-white/10 text-white">
                      <SelectItem value="fullstack">Full-Stack App</SelectItem>
                      <SelectItem value="web">Web App</SelectItem>
                      <SelectItem value="mobile">Mobile App</SelectItem>
                      <SelectItem value="api">API/Backend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateProject} className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center text-gray-400 py-20">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderCode className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2">No projects yet</h2>
            <p className="text-gray-400 mb-6">Create your first project to get started</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Project
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Your Projects</h2>
              <span className="text-sm text-gray-400">{projects.length} projects</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getProjectTypeIcon(project.projectType)}
                        <div>
                          <h3 className="font-semibold group-hover:text-blue-400 transition">
                            {project.name}
                          </h3>
                          <p className="text-xs text-gray-400 capitalize">{project.projectType}</p>
                        </div>
                      </div>
                      <div className={`text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                      {project.deploymentUrl && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Rocket className="w-3 h-3" />
                          Deployed
                        </div>
                      )}
                    </div>
                    
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.techStack.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 rounded bg-white/5">
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-white/5">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
