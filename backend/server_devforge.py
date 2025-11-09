from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime
from models_devforge import (
    Project, ProjectCreate, ProjectUpdate, ProjectChat, ProjectChatCreate,
    Deployment, DeploymentCreate, Collaborator, CollaboratorCreate,
    Activity, Comment, CommentCreate
)
from ai_devforge import DevForgeAI
from typing import List

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize AI
ai_system = DevForgeAI()

# Create app and router
app = FastAPI(title="DevForge AI")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Health check
@api_router.get("/")
async def root():
    return {"message": "DevForge AI Backend Running", "version": "1.0.0"}

# ==================== PROJECT ENDPOINTS ====================

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    """Get all projects"""
    try:
        projects = await db.projects.find().sort("updatedAt", -1).to_list(100)
        return [Project(**p) for p in projects]
    except Exception as e:
        logger.error(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get single project"""
    try:
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return Project(**project)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/projects", response_model=Project)
async def create_project(input: ProjectCreate):
    """Create new project"""
    try:
        project = Project(
            name=input.name,
            description=input.description,
            projectType=input.projectType,
            techStack=input.techStack
        )
        await db.projects.insert_one(project.dict())
        
        # Create activity
        activity = Activity(
            projectId=project.id,
            action="created",
            description=f"Project '{project.name}' created"
        )
        await db.activities.insert_one(activity.dict())
        
        return project
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.patch("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, input: ProjectUpdate):
    """Update project"""
    try:
        update_data = {k: v for k, v in input.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.projects.update_one(
            {"id": project_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = await db.projects.find_one({"id": project_id})
        return Project(**project)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete project"""
    try:
        result = await db.projects.delete_one({"id": project_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Delete related data
        await db.project_chats.delete_many({"projectId": project_id})
        await db.deployments.delete_many({"projectId": project_id})
        await db.activities.delete_many({"projectId": project_id})
        
        return {"success": True, "message": "Project deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== AI CHAT ENDPOINTS ====================

@api_router.get("/projects/{project_id}/chats", response_model=List[ProjectChat])
async def get_project_chats(project_id: str):
    """Get all chats for a project"""
    try:
        chats = await db.project_chats.find({"projectId": project_id}).sort("timestamp", 1).to_list(100)
        return [ProjectChat(**c) for c in chats]
    except Exception as e:
        logger.error(f"Error fetching chats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/projects/{project_id}/chats", response_model=ProjectChat)
async def create_project_chat(project_id: str, input: ProjectChatCreate):
    """Send message and get AI code generation"""
    try:
        # Get project
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get chat history
        history_chats = await db.project_chats.find({"projectId": project_id}).sort("timestamp", 1).to_list(50)
        history = [{"role": c.get("role"), "content": c.get("content")} for c in history_chats]
        
        # Save user message
        user_chat = ProjectChat(
            projectId=project_id,
            role="user",
            content=input.message
        )
        await db.project_chats.insert_one(user_chat.dict())
        
        # Generate AI response
        ai_result = await ai_system.generate_code(
            project_id=project_id,
            project_type=project.get("projectType", "fullstack"),
            message=input.message,
            history=history
        )
        
        # Save AI response
        ai_chat = ProjectChat(
            projectId=project_id,
            role="assistant",
            content=ai_result["message"],
            codeGenerated={"files": ai_result["code_files"]} if ai_result["code_files"] else None
        )
        await db.project_chats.insert_one(ai_chat.dict())
        
        # Update project timestamp
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"updatedAt": datetime.utcnow()}}
        )
        
        return ai_chat
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== DEPLOYMENT ENDPOINTS ====================

@api_router.get("/projects/{project_id}/deployments", response_model=List[Deployment])
async def get_deployments(project_id: str):
    """Get deployment history"""
    try:
        deployments = await db.deployments.find({"projectId": project_id}).sort("createdAt", -1).to_list(20)
        return [Deployment(**d) for d in deployments]
    except Exception as e:
        logger.error(f"Error fetching deployments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/projects/{project_id}/deploy", response_model=Deployment)
async def deploy_project(project_id: str):
    """Deploy project (mock implementation)"""
    try:
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create deployment record
        deployment = Deployment(
            projectId=project_id,
            status="success",
            deployedUrl=f"https://{project_id}.devforge.app",
            buildLogs=["Build started", "Installing dependencies", "Building application", "Deployment successful"],
            completedAt=datetime.utcnow()
        )
        await db.deployments.insert_one(deployment.dict())
        
        # Update project
        await db.projects.update_one(
            {"id": project_id},
            {"$set": {"status": "deployed", "deploymentUrl": deployment.deployedUrl, "updatedAt": datetime.utcnow()}}
        )
        
        # Create activity
        activity = Activity(
            projectId=project_id,
            action="deployed",
            description=f"Project deployed to {deployment.deployedUrl}"
        )
        await db.activities.insert_one(activity.dict())
        
        return deployment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deploying: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== COLLABORATION ENDPOINTS ====================

@api_router.get("/projects/{project_id}/collaborators", response_model=List[Collaborator])
async def get_collaborators(project_id: str):
    """Get project collaborators"""
    try:
        collaborators = await db.collaborators.find({"projectId": project_id}).to_list(50)
        return [Collaborator(**c) for c in collaborators]
    except Exception as e:
        logger.error(f"Error fetching collaborators: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/projects/{project_id}/collaborators", response_model=Collaborator)
async def add_collaborator(project_id: str, input: CollaboratorCreate):
    """Add collaborator to project"""
    try:
        collaborator = Collaborator(
            projectId=project_id,
            email=input.email,
            role=input.role
        )
        await db.collaborators.insert_one(collaborator.dict())
        
        # Create activity
        activity = Activity(
            projectId=project_id,
            action="collaborated",
            description=f"Added {input.email} as {input.role}"
        )
        await db.activities.insert_one(activity.dict())
        
        return collaborator
    except Exception as e:
        logger.error(f"Error adding collaborator: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ACTIVITY & COMMENTS ====================

@api_router.get("/projects/{project_id}/activities", response_model=List[Activity])
async def get_activities(project_id: str):
    """Get project activities"""
    try:
        activities = await db.activities.find({"projectId": project_id}).sort("timestamp", -1).to_list(50)
        return [Activity(**a) for a in activities]
    except Exception as e:
        logger.error(f"Error fetching activities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects/{project_id}/comments", response_model=List[Comment])
async def get_comments(project_id: str):
    """Get project comments"""
    try:
        comments = await db.comments.find({"projectId": project_id}).sort("timestamp", 1).to_list(100)
        return [Comment(**c) for c in comments]
    except Exception as e:
        logger.error(f"Error fetching comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/projects/{project_id}/comments", response_model=Comment)
async def add_comment(project_id: str, input: CommentCreate):
    """Add comment to project"""
    try:
        comment = Comment(
            projectId=project_id,
            content=input.content
        )
        await db.comments.insert_one(comment.dict())
        return comment
    except Exception as e:
        logger.error(f"Error adding comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
