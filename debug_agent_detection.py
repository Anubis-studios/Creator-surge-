#!/usr/bin/env python3
"""
Debug agent detection locally
"""

import sys
sys.path.append('/app/backend')

from agents import AgentSystem

def test_local_detection():
    """Test agent detection locally"""
    agent_system = AgentSystem()
    
    test_messages = [
        "Write a Python function to calculate fibonacci numbers",
        "Debug this JavaScript code for me", 
        "Help me with programming",
        "Create a business strategy for my startup",
        "Generate an image of a sunset",
        "Hello, how are you?"
    ]
    
    print("🔍 Local Agent Detection Test")
    print("=" * 40)
    
    for msg in test_messages:
        detected = agent_system.detect_agent_type(msg)
        print(f"Message: '{msg}'")
        print(f"Detected: {detected}")
        print()

if __name__ == "__main__":
    test_local_detection()