#!/usr/bin/env python3
"""
Test AI response quality and verify LLM integration
"""

import asyncio
import aiohttp
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')

async def test_ai_responses():
    """Test AI response quality"""
    
    async with aiohttp.ClientSession() as session:
        # Create test conversation
        payload = {"title": "AI Response Quality Test"}
        async with session.post(
            f"{BASE_URL}/api/conversations",
            json=payload,
            headers={'Content-Type': 'application/json'}
        ) as response:
            conv_data = await response.json()
            conversation_id = conv_data['id']
            
        print("🤖 Testing AI Response Quality")
        print("=" * 50)
        
        # Test different agent types
        test_cases = [
            {
                "message": "Write a simple Python function to add two numbers",
                "agent_type": "code",
                "expected_keywords": ["def", "return", "python"]
            },
            {
                "message": "What's a good marketing strategy for a tech startup?",
                "agent_type": "strategy", 
                "expected_keywords": ["marketing", "strategy", "startup"]
            },
            {
                "message": "Hello, tell me about yourself",
                "agent_type": "text",
                "expected_keywords": ["Creator Surge", "AI", "assistant"]
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\nTest {i}: {test_case['agent_type'].upper()} Agent")
            print(f"Message: '{test_case['message']}'")
            
            payload = {
                "conversationId": conversation_id,
                "message": test_case['message']
            }
            
            try:
                async with session.post(
                    f"{BASE_URL}/api/chat",
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        ai_response = data['aiMessage']['content']
                        detected_agent = data['userMessage']['agentType']
                        
                        print(f"Detected Agent: {detected_agent}")
                        print(f"Response Length: {len(ai_response)} characters")
                        print(f"Response Preview: {ai_response[:100]}...")
                        
                        # Check if response contains expected keywords
                        response_lower = ai_response.lower()
                        found_keywords = [kw for kw in test_case['expected_keywords'] 
                                        if kw.lower() in response_lower]
                        
                        if len(ai_response) > 20 and not ai_response.startswith("I apologize"):
                            print("✅ AI Response Generated Successfully")
                        else:
                            print("❌ AI Response Failed or Error Message")
                            
                    else:
                        print(f"❌ HTTP Error: {response.status}")
                        
            except Exception as e:
                print(f"❌ Exception: {str(e)}")
                
        # Clean up
        await session.delete(f"{BASE_URL}/api/conversations/{conversation_id}")
        print(f"\n🧹 Cleaned up test conversation")

if __name__ == "__main__":
    asyncio.run(test_ai_responses())