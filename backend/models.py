from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversationId: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    agentType: Optional[str] = None  # "text", "code", "image", "strategy"

class MessageCreate(BaseModel):
    conversationId: str
    role: str
    content: str
    agentType: Optional[str] = None

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    preview: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    messageCount: int = 0

class ConversationCreate(BaseModel):
    title: str

class ChatRequest(BaseModel):
    conversationId: str
    message: str
    agentType: Optional[str] = None  # "text", "code", "image", "strategy"

class ChatResponse(BaseModel):
    userMessage: Message
    aiMessage: Message
