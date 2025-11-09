#!/usr/bin/env python3
"""
Memory Test for Creator Surge AI - Multi-turn conversation with context retention
Tests the AI's ability to remember and reference previous messages in a conversation
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

class MemoryTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = None
        self.conversation_id = None
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
        
    async def test_create_memory_conversation(self):
        """Test 1: Create Test Conversation with title 'Memory Test'"""
        try:
            payload = {"title": "Memory Test"}
            async with self.session.post(
                f"{self.base_url}/api/conversations",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'id' in data and data['title'] == "Memory Test":
                        self.conversation_id = data['id']
                        self.log_result("Create Memory Test Conversation", True, f"Created conversation with ID: {self.conversation_id}")
                        return True
                    else:
                        self.log_result("Create Memory Test Conversation", False, "Missing ID or title mismatch", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Create Memory Test Conversation", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Create Memory Test Conversation", False, f"Error: {str(e)}")
            return False
            
    async def test_first_message(self):
        """Test 2: First Message - 'My favorite color is blue'"""
        if not self.conversation_id:
            self.log_result("First Message", False, "No conversation ID available")
            return False
            
        try:
            payload = {
                "conversationId": self.conversation_id,
                "message": "My favorite color is blue"
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
                        self.log_result("First Message", True, f"AI responded to color preference: {data['aiMessage']['content'][:100]}...")
                        return True
                    else:
                        self.log_result("First Message", False, "Invalid response structure", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("First Message", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("First Message", False, f"Error: {str(e)}")
            return False
            
    async def test_memory_recall_color(self):
        """Test 3: Second Message (Memory Test) - 'What is my favorite color?'"""
        if not self.conversation_id:
            self.log_result("Memory Recall - Color", False, "No conversation ID available")
            return False
            
        try:
            payload = {
                "conversationId": self.conversation_id,
                "message": "What is my favorite color?"
            }
            async with self.session.post(
                f"{self.base_url}/api/chat",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if ('userMessage' in data and 'aiMessage' in data):
                        ai_response = data['aiMessage']['content'].lower()
                        # Check if AI remembers the color blue
                        if 'blue' in ai_response:
                            self.log_result("Memory Recall - Color", True, f"AI correctly remembered favorite color: {data['aiMessage']['content'][:100]}...")
                            return True
                        else:
                            self.log_result("Memory Recall - Color", False, f"AI did not recall 'blue' color. Response: {data['aiMessage']['content']}")
                            return False
                    else:
                        self.log_result("Memory Recall - Color", False, "Invalid response structure", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Memory Recall - Color", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Memory Recall - Color", False, f"Error: {str(e)}")
            return False
            
    async def test_third_message(self):
        """Test 4: Third Message (Complex Context) - 'I'm planning to build an e-commerce website'"""
        if not self.conversation_id:
            self.log_result("Third Message", False, "No conversation ID available")
            return False
            
        try:
            payload = {
                "conversationId": self.conversation_id,
                "message": "I'm planning to build an e-commerce website"
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
                        self.log_result("Third Message", True, f"AI responded to e-commerce plan: {data['aiMessage']['content'][:100]}...")
                        return True
                    else:
                        self.log_result("Third Message", False, "Invalid response structure", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Third Message", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Third Message", False, f"Error: {str(e)}")
            return False
            
    async def test_memory_recall_project(self):
        """Test 5: Fourth Message (Context Recall) - 'What am I planning to build?'"""
        if not self.conversation_id:
            self.log_result("Memory Recall - Project", False, "No conversation ID available")
            return False
            
        try:
            payload = {
                "conversationId": self.conversation_id,
                "message": "What am I planning to build?"
            }
            async with self.session.post(
                f"{self.base_url}/api/chat",
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if ('userMessage' in data and 'aiMessage' in data):
                        ai_response = data['aiMessage']['content'].lower()
                        # Check if AI remembers the e-commerce website
                        if 'e-commerce' in ai_response or 'ecommerce' in ai_response or 'website' in ai_response:
                            self.log_result("Memory Recall - Project", True, f"AI correctly remembered e-commerce project: {data['aiMessage']['content'][:100]}...")
                            return True
                        else:
                            self.log_result("Memory Recall - Project", False, f"AI did not recall e-commerce website. Response: {data['aiMessage']['content']}")
                            return False
                    else:
                        self.log_result("Memory Recall - Project", False, "Invalid response structure", data)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Memory Recall - Project", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Memory Recall - Project", False, f"Error: {str(e)}")
            return False
            
    async def test_agent_type_persistence(self):
        """Test 6: Verify agentType is correctly stored and used across messages"""
        if not self.conversation_id:
            self.log_result("Agent Type Persistence", False, "No conversation ID available")
            return False
            
        try:
            async with self.session.get(f"{self.base_url}/api/conversations/{self.conversation_id}/messages") as response:
                if response.status == 200:
                    messages = await response.json()
                    if isinstance(messages, list) and len(messages) >= 8:
                        # Check that all messages have agentType
                        agent_types = [msg.get('agentType') for msg in messages if msg.get('agentType')]
                        if len(agent_types) >= 8:
                            self.log_result("Agent Type Persistence", True, f"All messages have agentType. Types used: {set(agent_types)}")
                            return True
                        else:
                            self.log_result("Agent Type Persistence", False, f"Some messages missing agentType. Found {len(agent_types)} out of {len(messages)}")
                            return False
                    else:
                        self.log_result("Agent Type Persistence", False, f"Expected at least 8 messages, got {len(messages) if isinstance(messages, list) else 'non-list'}")
                        return False
                else:
                    text = await response.text()
                    self.log_result("Agent Type Persistence", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Agent Type Persistence", False, f"Error: {str(e)}")
            return False
            
    async def test_get_all_messages(self):
        """Test 7: Get Messages - Verify all 8 messages (4 user + 4 assistant) are stored"""
        if not self.conversation_id:
            self.log_result("Get All Messages", False, "No conversation ID available")
            return False
            
        try:
            async with self.session.get(f"{self.base_url}/api/conversations/{self.conversation_id}/messages") as response:
                if response.status == 200:
                    messages = await response.json()
                    if isinstance(messages, list):
                        user_messages = [msg for msg in messages if msg.get('role') == 'user']
                        ai_messages = [msg for msg in messages if msg.get('role') == 'assistant']
                        
                        if len(user_messages) == 4 and len(ai_messages) == 4:
                            self.log_result("Get All Messages", True, f"Found all 8 messages: 4 user + 4 assistant")
                            
                            # Print conversation history for verification
                            print("   Conversation History:")
                            for i, msg in enumerate(messages, 1):
                                role = msg.get('role', 'unknown')
                                content = msg.get('content', '')[:50] + "..." if len(msg.get('content', '')) > 50 else msg.get('content', '')
                                agent_type = msg.get('agentType', 'N/A')
                                print(f"   {i}. {role.upper()} ({agent_type}): {content}")
                            
                            return True
                        else:
                            self.log_result("Get All Messages", False, f"Expected 4 user + 4 AI messages, got {len(user_messages)} user + {len(ai_messages)} AI")
                            return False
                    else:
                        self.log_result("Get All Messages", False, "Response is not a list", messages)
                        return False
                else:
                    text = await response.text()
                    self.log_result("Get All Messages", False, f"Status {response.status}", text)
                    return False
        except Exception as e:
            self.log_result("Get All Messages", False, f"Error: {str(e)}")
            return False
            
    async def cleanup_test_conversation(self):
        """Cleanup: Delete the test conversation"""
        if not self.conversation_id:
            return True
            
        try:
            async with self.session.delete(f"{self.base_url}/api/conversations/{self.conversation_id}") as response:
                if response.status == 200:
                    print("🧹 Cleaned up test conversation")
                    return True
                else:
                    print(f"⚠️  Failed to cleanup test conversation: {response.status}")
                    return False
        except Exception as e:
            print(f"⚠️  Error during cleanup: {str(e)}")
            return False
            
    async def run_memory_tests(self):
        """Run all memory tests in sequence"""
        print("🧠 Starting Creator Surge AI Memory Tests")
        print("Testing multi-turn conversation with context retention")
        print(f"Testing against: {self.base_url}")
        print("=" * 70)
        
        await self.setup()
        
        try:
            # Test sequence for memory testing
            tests = [
                self.test_create_memory_conversation,
                self.test_first_message,
                self.test_memory_recall_color,
                self.test_third_message,
                self.test_memory_recall_project,
                self.test_agent_type_persistence,
                self.test_get_all_messages
            ]
            
            for test in tests:
                await test()
                await asyncio.sleep(1)  # Delay between tests to ensure proper sequencing
                
            # Cleanup
            await self.cleanup_test_conversation()
                
        finally:
            await self.cleanup()
            
        # Summary
        print("=" * 70)
        print("📊 MEMORY TEST SUMMARY")
        print("=" * 70)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All memory tests passed! AI conversation memory is working correctly.")
            print("✅ AI successfully remembers context across multiple turns")
            print("✅ Conversation history is properly maintained")
            print("✅ Agent types are persisted correctly")
        else:
            print(f"\n⚠️  {total - passed} memory test(s) failed.")
            failed_tests = [result['test'] for result in self.test_results if not result['success']]
            print("Failed tests:")
            for test in failed_tests:
                print(f"   - {test}")
            
        return passed == total

async def main():
    """Main test runner"""
    tester = MemoryTester()
    success = await tester.run_memory_tests()
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    exit(0 if result else 1)