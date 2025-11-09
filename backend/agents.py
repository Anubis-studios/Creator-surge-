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
            "strategy": "You are Creator Surge AI's Strategy Agent, specializing in business strategy, planning, marketing, and decision-making. You provide actionable insights, structured plans, and strategic recommendations. Be analytical, data-driven, and practical."
        }
        return system_messages.get(agent_type, system_messages["text"])
    
    async def generate_response(self, message: str, agent_type: str = "text", conversation_history: list = None) -> str:
        """Generate AI response using specified agent type"""
        try:
            # Create unique session ID for this conversation
            session_id = f"session_{agent_type}"
            
            # Initialize chat with system message
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=self.get_system_message(agent_type)
            )
            
            # Use GPT-4o-mini for faster responses
            chat.with_model("openai", "gpt-4o-mini")
            
            # Create user message
            user_message = UserMessage(text=message)
            
            # Send message and get response
            response = await chat.send_message(user_message)
            
            return response
            
        except Exception as e:
            return f"I apologize, but I encountered an error: {str(e)}. Please try again."
    
    def detect_agent_type(self, message: str) -> str:
        """Automatically detect which agent should handle the message"""
        message_lower = message.lower()
        
        # Code-related keywords
        code_keywords = ['code', 'function', 'debug', 'programming', 'python', 'javascript', 
                        'java', 'algorithm', 'api', 'bug', 'error', 'syntax', 'compile']
        
        # Image-related keywords
        image_keywords = ['image', 'picture', 'photo', 'visual', 'generate image', 
                         'create image', 'draw', 'illustration']
        
        # Strategy-related keywords
        strategy_keywords = ['strategy', 'business', 'marketing', 'plan', 'growth', 
                           'startup', 'launch', 'campaign', 'roi', 'kpi', 'market']
        
        # Check for keywords
        if any(keyword in message_lower for keyword in code_keywords):
            return "code"
        elif any(keyword in message_lower for keyword in image_keywords):
            return "image"
        elif any(keyword in message_lower for keyword in strategy_keywords):
            return "strategy"
        else:
            return "text"
