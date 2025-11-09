#!/usr/bin/env python3
"""
Test agent detection logic specifically
"""

import asyncio
import aiohttp
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')

async def test_agent_detection():
    """Test different messages for agent detection"""
    
    test_cases = [
        {
            "message": "Write a Python function to calculate fibonacci numbers",
            "expected": "code",
            "description": "Python function request"
        },
        {
            "message": "Debug this JavaScript code for me",
            "expected": "code", 
            "description": "Debug request"
        },
        {
            "message": "Help me with programming",
            "expected": "code",
            "description": "Programming help"
        },
        {
            "message": "Create a business strategy for my startup",
            "expected": "strategy",
            "description": "Business strategy"
        },
        {
            "message": "Generate an image of a sunset",
            "expected": "image",
            "description": "Image generation"
        },
        {
            "message": "Hello, how are you?",
            "expected": "text",
            "description": "General conversation"
        }
    ]
    
    async with aiohttp.ClientSession() as session:
        # First create a test conversation
        payload = {"title": "Agent Detection Test"}
        async with session.post(
            f"{BASE_URL}/api/conversations",
            json=payload,
            headers={'Content-Type': 'application/json'}
        ) as response:
            if response.status != 200:
                print("Failed to create test conversation")
                return
            conv_data = await response.json()
            conversation_id = conv_data['id']
            
        print("🔍 Testing Agent Auto-Detection")
        print("=" * 50)
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\nTest {i}: {test_case['description']}")
            print(f"Message: '{test_case['message']}'")
            print(f"Expected: {test_case['expected']}")
            
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
                        detected_agent = data['userMessage'].get('agentType', 'unknown')
                        
                        if detected_agent == test_case['expected']:
                            print(f"✅ PASS - Detected: {detected_agent}")
                        else:
                            print(f"❌ FAIL - Detected: {detected_agent}, Expected: {test_case['expected']}")
                    else:
                        print(f"❌ FAIL - HTTP {response.status}")
                        
            except Exception as e:
                print(f"❌ ERROR - {str(e)}")
                
        # Clean up test conversation
        await session.delete(f"{BASE_URL}/api/conversations/{conversation_id}")

if __name__ == "__main__":
    asyncio.run(test_agent_detection())