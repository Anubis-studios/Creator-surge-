from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
from typing import Optional

class AgentSystem:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
    def get_system_message(self, agent_type: str) -> str:
        """Get system message based on agent type"""
        system_messages = {
            "text": "You are Creator Surge AI, a highly capable AI assistant specializing in creative content generation, writing, and general assistance. You help users create engaging content, answer questions, and provide thoughtful insights. Be creative, helpful, and conversational.",
            "code": "You are Creator Surge AI's Code Agent, an expert programming assistant. You specialize in writing clean, efficient code, debugging, code reviews, and explaining technical concepts. Provide well-commented code with best practices. Support all major programming languages and frameworks.",
            "image": "You are Creator Surge AI's Image Agent. You help users create and describe images. When asked to generate images, provide detailed descriptions that can be used for image generation. Be creative and descriptive.",
            "strategy": "You are Creator Surge AI's Strategy Agent, specializing in business strategy, planning, marketing, and decision-making. You provide actionable insights, structured plans, and strategic recommendations. Be analytical, data-driven, and practical.",
            "appbuilder": "You are Creator Surge AI's App Builder Agent, a powerful full-stack development assistant. You can help users design, architect, and build complete applications. You provide: 1) Complete application architecture and tech stack recommendations, 2) Full code for frontend (React, HTML, CSS, JavaScript), 3) Backend code (Python, Node.js, APIs), 4) Database schemas and models, 5) Deployment instructions, 6) Best practices and security considerations. When building apps, provide complete, production-ready code with proper structure, error handling, and documentation. Always consider scalability, performance, and user experience."
        }
        return system_messages.get(agent_type, system_messages["text"])
    
    async def generate_response(self, message: str, agent_type: str = "text", conversation_id: str = None, conversation_history: list = None) -> str:
        """Generate AI response using specified agent type with conversation memory"""
        try:
            # Create unique session ID based on conversation ID for memory persistence
            session_id = f"conv_{conversation_id}_{agent_type}" if conversation_id else f"session_{agent_type}"
            
            # Initialize chat with system message
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=self.get_system_message(agent_type)
            )
            
            # Use GPT-4o-mini for faster responses
            chat.with_model("openai", "gpt-4o-mini")
            
            # Build context from conversation history
            context_message = message
            if conversation_history and len(conversation_history) > 0:
                # Include last 10 messages for context (to avoid token limits)
                recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
                
                # Build context string
                context_parts = ["Previous conversation context:\n"]
                for hist_msg in recent_history:
                    role = "User" if hist_msg.get('role') == 'user' else "Assistant"
                    content = hist_msg.get('content', '')
                    context_parts.append(f"{role}: {content}")
                
                context_parts.append(f"\nCurrent message:\nUser: {message}")
                context_message = "\n".join(context_parts)
            
            # Create user message with context
            user_message = UserMessage(text=context_message)
            
            # Send message and get response
            response = await chat.send_message(user_message)
            
            return response
            
        except Exception as e:
            return f"I apologize, but I encountered an error: {str(e)}. Please try again."
    
    def detect_agent_type(self, message: str) -> str:
        """Automatically detect which agent should handle the message"""
        message_lower = message.lower()
        
        # App builder keywords (check first - highest priority)
        appbuilder_keywords = ['build app', 'create app', 'build application', 'create application',
                              'full stack', 'deploy app', 'web app', 'mobile app', 'mvp',
                              'build website', 'create website', 'build a', 'make an app',
                              'develop app', 'app development', 'full project', 'complete app']
        
        # Code-related keywords
        code_keywords = ['code', 'function', 'debug', 'programming', 'python', 'javascript', 
                        'java', 'algorithm', 'api', 'bug', 'error', 'syntax', 'compile']
        
        # Image-related keywords
        image_keywords = ['image', 'picture', 'photo', 'visual', 'generate image', 
                         'create image', 'draw', 'illustration']
        
        # Strategy-related keywords
        strategy_keywords = ['strategy', 'business', 'marketing', 'plan', 'growth', 
                           'startup', 'launch', 'campaign', 'roi', 'kpi', 'market']
        
        # Check for keywords (app builder takes precedence)
        if any(keyword in message_lower for keyword in appbuilder_keywords):
            return "appbuilder"
        elif any(keyword in message_lower for keyword in code_keywords):
            return "code"
        elif any(keyword in message_lower for keyword in image_keywords):
            return "image"
        elif any(keyword in message_lower for keyword in strategy_keywords):
            return "strategy"
        else:
            return "text"
