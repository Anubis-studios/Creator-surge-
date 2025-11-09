from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid

# Project Models
class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    projectType: str  # "web", "mobile", "api", "fullstack"
    status: str = "active"  # "active", "deployed", "archived"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    userId: str = "default_user"  # For future auth
    techStack: List[str] = []
    deploymentUrl: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    projectType: str
    techStack: List[str] = []

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    techStack: Optional[List[str]] = None

# AI Chat for Projects
class ProjectChat(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    projectId: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    codeGenerated: Optional[Dict] = None  # {"files": [{"path": "", "content": ""}]}

class ProjectChatCreate(BaseModel):
    projectId: str
    message: str

# Deployment Models
class Deployment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    projectId: str
    status: str  # "pending", "building", "success", "failed"
    deployedUrl: Optional[str] = None
    buildLogs: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    completedAt: Optional[datetime] = None

class DeploymentCreate(BaseModel):
    projectId: str

# Collaboration Models
class Collaborator(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    projectId: str
    email: str
    role: str = "viewer"  # "owner", "editor", "viewer"
    addedAt: datetime = Field(default_factory=datetime.utcnow)

class CollaboratorCreate(BaseModel):
    projectId: str
    email: str
    role: str = "viewer"

# Activity/Comment Models
class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    projectId: str
    userId: str = "default_user"
    action: str  # "created", "updated", "deployed", "commented"
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    projectId: str
    userId: str = "default_user"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CommentCreate(BaseModel):
    projectId: str
    content: str
