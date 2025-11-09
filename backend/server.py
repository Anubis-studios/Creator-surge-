from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime
from models import Message, MessageCreate, Conversation, ConversationCreate, ChatRequest, ChatResponse
from agents import AgentSystem
from typing import List

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Agent System
agent_system = AgentSystem()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Creator Surge AI Backend Running"}

# Conversation endpoints
@api_router.get("/conversations", response_model=List[Conversation])
async def get_conversations():
    """Get all conversations"""
    try:
        conversations = await db.conversations.find().sort("timestamp", -1).to_list(1000)
        return [Conversation(**conv) for conv in conversations]
    except Exception as e:
        logger.error(f"Error fetching conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
async def get_messages(conversation_id: str):
    """Get all messages in a conversation"""
    try:
        messages = await db.messages.find({"conversationId": conversation_id}).sort("timestamp", 1).to_list(1000)
        return [Message(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/conversations", response_model=Conversation)
async def create_conversation(input: ConversationCreate):
    """Create new conversation"""
    try:
        conversation = Conversation(
            title=input.title,
            preview="Start a new conversation...",
            timestamp=datetime.utcnow(),
            messageCount=0
        )
        await db.conversations.insert_one(conversation.dict())
        return conversation
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation and its messages"""
    try:
        # Delete all messages in conversation
        await db.messages.delete_many({"conversationId": conversation_id})
        # Delete conversation
        result = await db.conversations.delete_one({"id": conversation_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"success": True, "message": "Conversation deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send message and get AI response with conversation memory"""
    try:
        # Auto-detect agent type if not specified
        agent_type = request.agentType or agent_system.detect_agent_type(request.message)
        
        # Get conversation history for context
        history_messages = await db.messages.find(
            {"conversationId": request.conversationId}
        ).sort("timestamp", 1).to_list(100)
        
        # Convert to dict format for agent system
        conversation_history = [
            {"role": msg.get("role"), "content": msg.get("content")}
            for msg in history_messages
        ]
        
        # Create user message
        user_message = Message(
            conversationId=request.conversationId,
            role="user",
            content=request.message,
            timestamp=datetime.utcnow(),
            agentType=agent_type
        )
        
        # Save user message to database
        await db.messages.insert_one(user_message.dict())
        
        # Get AI response with conversation context
        ai_response_text = await agent_system.generate_response(
            message=request.message,
            agent_type=agent_type,
            conversation_id=request.conversationId,
            conversation_history=conversation_history
        )
        
        # Create AI message
        ai_message = Message(
            conversationId=request.conversationId,
            role="assistant",
            content=ai_response_text,
            timestamp=datetime.utcnow(),
            agentType=agent_type
        )
        
        # Save AI message to database
        await db.messages.insert_one(ai_message.dict())
        
        # Update conversation preview and message count
        preview = request.message[:50] + "..." if len(request.message) > 50 else request.message
        await db.conversations.update_one(
            {"id": request.conversationId},
            {
                "$set": {"preview": preview, "timestamp": datetime.utcnow()},
                "$inc": {"messageCount": 2}
            }
        )
        
        return ChatResponse(
            userMessage=user_message,
            aiMessage=ai_message
        )
        
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
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
