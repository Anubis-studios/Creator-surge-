#!/usr/bin/env python3
"""
Backend API Testing for Creator Surge AI
Tests all backend endpoints with realistic data
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = None
        self.test_conversation_id = None
        self.test_results = []
        
    async def setup(self):
        """Setup test session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
            
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response': response_data
        })
        
    async def test_health_check(self):
        """Test GET /api/ - Health check endpoint"""
        try:
            async with self.session.get(f"{self.base_url}/api/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "Creator Surge AI Backend Running" in data.get('message', ''):
                        self.log_result("Health Check", True, "Backend is running")
                        return True
                    else:
                        self.log_result("Health Check", False, f"Unexpected message: {data}")
                        return False
                else:
                    text = await response.text()
                    self.log_result("Health Check", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
            return False
            
    async def test_create_conversation(self):
        """Test POST /api/conversations - Create a new conversation"""
        try:
            payload = {"title": "Test Conversation - AI Development Help"}
            async with self.session.post(
                f"{self.base_url}/api/conversations",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'id' in data and data['title'] == payload['title']:
                        self.test_conversation_id = data['id']
                        self.log_result("Create Conversation", True, f"Created conversation with ID: {self.test_conversation_id}")
                        return True
                    else:
                        self.log_result("Create Conversation", False, "Missing ID or title mismatch", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Create Conversation", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Create Conversation", False, f"Error: {str(e)}")
            return False
            
    async def test_get_conversations(self):
        """Test GET /api/conversations - Get all conversations"""
        try:
            async with self.session.get(f"{self.base_url}/api/conversations") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        # Check if our test conversation exists
                        found_test_conv = any(conv.get('id') == self.test_conversation_id for conv in data)
                        if found_test_conv:
                            self.log_result("Get Conversations", True, f"Found {len(data)} conversations including test conversation")
                            return True
                        else:
                            self.log_result("Get Conversations", False, "Test conversation not found in list")
                            return False
                    else:
                        self.log_result("Get Conversations", False, "Response is not a list", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Get Conversations", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Get Conversations", False, f"Error: {str(e)}")
            return False
            
    async def test_chat_general(self):
        """Test POST /api/chat - Send a general message"""
        if not self.test_conversation_id:
            self.log_result("Chat General", False, "No conversation ID available")
            return False
            
        try:
            payload = {
                "conversationId": self.test_conversation_id,
                "message": "Hello, can you help me build an app?",
                "agentType": "text"
            }
            async with self.session.post(
                f"{self.base_url}/api/chat",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if ('userMessage' in data and 'aiMessage' in data and 
                        data['userMessage']['content'] == payload['message'] and
                        len(data['aiMessage']['content']) > 0):
                        self.log_result("Chat General", True, f"AI responded with {len(data['aiMessage']['content'])} characters")
                        return True
                    else:
                        self.log_result("Chat General", False, "Invalid response structure", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Chat General", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Chat General", False, f"Error: {str(e)}")
            return False
            
    async def test_get_messages(self):
        """Test GET /api/conversations/{id}/messages - Get messages for conversation"""
        if not self.test_conversation_id:
            self.log_result("Get Messages", False, "No conversation ID available")
            return False
            
        try:
            async with self.session.get(f"{self.base_url}/api/conversations/{self.test_conversation_id}/messages") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list) and len(data) >= 2:  # Should have user + AI message
                        user_msg = next((msg for msg in data if msg['role'] == 'user'), None)
                        ai_msg = next((msg for msg in data if msg['role'] == 'assistant'), None)
                        if user_msg and ai_msg:
                            self.log_result("Get Messages", True, f"Found {len(data)} messages (user + AI)")
                            return True
                        else:
                            self.log_result("Get Messages", False, "Missing user or AI message")
                            return False
                    else:
                        self.log_result("Get Messages", False, f"Expected at least 2 messages, got {len(data) if isinstance(data, list) else 'non-list'}")
                        return False
                else:
                    text = await response.text()
                    self.log_result("Get Messages", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Get Messages", False, f"Error: {str(e)}")
            return False
            
    async def test_agent_auto_detection(self):
        """Test agent auto-detection with code-related message"""
        if not self.test_conversation_id:
            self.log_result("Agent Auto-Detection", False, "No conversation ID available")
            return False
            
        try:
            payload = {
                "conversationId": self.test_conversation_id,
                "message": "Write a Python function to calculate fibonacci numbers"
            }
            async with self.session.post(
                f"{self.base_url}/api/chat",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if ('userMessage' in data and 'aiMessage' in data):
                        # Check if code agent was detected
                        agent_type = data['userMessage'].get('agentType', '')
                        if agent_type == 'code':
                            self.log_result("Agent Auto-Detection", True, f"Correctly detected '{agent_type}' agent for code request")
                            return True
                        else:
                            self.log_result("Agent Auto-Detection", False, f"Expected 'code' agent, got '{agent_type}'")
                            return False
                    else:
                        self.log_result("Agent Auto-Detection", False, "Invalid response structure", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Agent Auto-Detection", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Agent Auto-Detection", False, f"Error: {str(e)}")
            return False
            
    async def test_delete_conversation(self):
        """Test DELETE /api/conversations/{id} - Delete the test conversation"""
        if not self.test_conversation_id:
            self.log_result("Delete Conversation", False, "No conversation ID available")
            return False
            
        try:
            async with self.session.delete(f"{self.base_url}/api/conversations/{self.test_conversation_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('success') == True:
                        self.log_result("Delete Conversation", True, "Conversation deleted successfully")
                        return True
                    else:
                        self.log_result("Delete Conversation", False, "Success flag not true", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Delete Conversation", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Delete Conversation", False, f"Error: {str(e)}")
            return False
            
    async def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Creator Surge AI Backend Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        await self.setup()
        
        try:
            # Test sequence as requested
            tests = [
                self.test_health_check,
                self.test_create_conversation,
                self.test_get_conversations,
                self.test_chat_general,
                self.test_get_messages,
                self.test_agent_auto_detection,
                self.test_delete_conversation
            ]
            
            for test in tests:
                await test()
                await asyncio.sleep(0.5)  # Small delay between tests
                
        finally:
            await self.cleanup()
            
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All tests passed! Backend is working correctly.")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check details above.")
            
        return passed == total

async def main():
    """Main test runner"""
    tester = BackendTester()
    success = await tester.run_all_tests()
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    exit(0 if result else 1)