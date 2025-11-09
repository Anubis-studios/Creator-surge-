// Mock data for Creator Surge AI

export const mockConversations = [
  {
    id: '1',
    title: 'Marketing Strategy Ideas',
    preview: 'Can you help me create a marketing strategy...',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Can you help me create a marketing strategy for a new app launch?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'm2',
        role: 'assistant',
        content: "I'd be happy to help you create a marketing strategy for your app launch! Here's a comprehensive approach:\n\n1. **Pre-Launch Phase**\n   - Build anticipation with teaser campaigns\n   - Create a landing page with email signup\n   - Engage with beta testers\n\n2. **Launch Phase**\n   - Press release distribution\n   - Social media campaign\n   - Influencer partnerships\n\n3. **Post-Launch**\n   - Gather user feedback\n   - Iterate on features\n   - Content marketing\n\nWhat type of app are you launching?",
        timestamp: new Date(Date.now() - 3590000).toISOString()
      }
    ]
  },
  {
    id: '2',
    title: 'Python Code Review',
    preview: 'Review this Python function for me...',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: 'Review this Python function for me and suggest improvements.',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'm4',
        role: 'assistant',
        content: "I'd be happy to review your Python code! Please share the function you'd like me to analyze, and I'll provide detailed feedback on:\n\n- Code structure and readability\n- Performance optimization\n- Best practices\n- Security considerations\n- Testing suggestions\n\nGo ahead and paste your code!",
        timestamp: new Date(Date.now() - 7190000).toISOString()
      }
    ]
  },
  {
    id: '3',
    title: 'Creative Writing Help',
    preview: 'I need help writing a short story...',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'I need help writing a short story about time travel.',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'm6',
        role: 'assistant',
        content: "Great topic! Time travel stories offer endless possibilities. Let me help you develop this:\n\n**Story Elements to Consider:**\n- What's the time travel mechanism? (Machine, natural phenomenon, magic)\n- What time period will they visit?\n- What's the main conflict or goal?\n- Will there be paradoxes to navigate?\n\n**Potential Plot:**\nA young scientist discovers their grandmother's journal containing equations for time travel. When they build the device, they travel back to prevent a tragedy, only to realize their interference might erase their own existence.\n\nWould you like me to develop this further or explore a different angle?",
        timestamp: new Date(Date.now() - 86390000).toISOString()
      }
    ]
  }
];

export const mockAIResponses = [
  "That's a great question! Let me help you with that.",
  "I understand what you're looking for. Here's my take on this:",
  "Interesting! Let me break this down for you.",
  "I can definitely assist with that. Here's what I suggest:",
  "Let me provide you with a comprehensive answer."
];

export const getRandomResponse = () => {
  return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
};
