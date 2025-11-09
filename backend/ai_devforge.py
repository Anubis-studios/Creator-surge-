from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import json
from typing import Dict, List

class DevForgeAI:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
    def get_system_message(self, project_type: str) -> str:
        """Get system message based on project type"""
        base_message = """You are DevForge AI, an expert full-stack development assistant. 
You help users build complete applications by generating production-ready code.

When generating code:
1. Provide complete, working implementations
2. Use modern best practices and patterns
3. Include proper error handling
4. Add helpful comments
5. Structure code with proper file organization
6. Use the specified tech stack
"""
        
        type_specific = {
            "web": "\nSpecialize in React, HTML, CSS, JavaScript, and modern web frameworks.",
            "mobile": "\nSpecialize in React Native, Flutter, or native mobile development.",
            "api": "\nSpecialize in RESTful APIs, FastAPI, Express, and backend architecture.",
            "fullstack": "\nSpecialize in complete full-stack applications with frontend, backend, and database."
        }
        
        return base_message + type_specific.get(project_type, "")
    
    async def generate_code(self, project_id: str, project_type: str, message: str, history: List[Dict] = None) -> Dict:
        """Generate code based on user message"""
        try:
            session_id = f"project_{project_id}"
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=self.get_system_message(project_type)
            )
            
            chat.with_model("openai", "gpt-4o")
            
            # Build context with history
            context_message = message
            if history and len(history) > 0:
                recent_history = history[-5:]  # Last 5 messages
                context_parts = ["Previous conversation:\n"]
                for hist in recent_history:
                    role = "User" if hist.get('role') == 'user' else "Assistant"
                    content = hist.get('content', '')
                    context_parts.append(f"{role}: {content}")
                context_parts.append(f"\nCurrent request:\nUser: {message}")
                context_message = "\n".join(context_parts)
            
            user_message = UserMessage(text=context_message)
            response = await chat.send_message(user_message)
            
            # Try to extract code blocks from response
            code_files = self.extract_code_files(response)
            
            return {
                "message": response,
                "code_files": code_files
            }
            
        except Exception as e:
            return {
                "message": f"Error generating code: {str(e)}",
                "code_files": []
            }
    
    def extract_code_files(self, response: str) -> List[Dict]:
        """Extract code blocks from AI response"""
        code_files = []
        lines = response.split('\n')
        
        current_file = None
        current_code = []
        in_code_block = False
        
        for line in lines:
            # Check for file path indicators
            if '```' in line:
                if in_code_block:
                    # End of code block
                    if current_file:
                        code_files.append({
                            "path": current_file,
                            "content": '\n'.join(current_code)
                        })
                    current_file = None
                    current_code = []
                    in_code_block = False
                else:
                    # Start of code block
                    in_code_block = True
                    # Try to extract filename from ```javascript filename.js
                    parts = line.split('```')
                    if len(parts) > 1 and parts[1].strip():
                        lang_and_file = parts[1].strip().split()
                        if len(lang_and_file) > 1:
                            current_file = lang_and_file[1]
            elif in_code_block:
                current_code.append(line)
            elif line.strip().startswith('//') and 'file:' in line.lower():
                # Comment indicating file path: // file: src/App.js
                current_file = line.split('file:')[-1].strip()
        
        return code_files
