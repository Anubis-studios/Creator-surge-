# Creator Surge AI - API Contracts & Backend Implementation Plan

## Mock Data to Replace

### Frontend Mock (src/mock.js)
Currently mocking:
- **mockConversations**: Array of conversation objects with messages
- **mockAIResponses**: Array of sample AI responses
- **getRandomResponse()**: Returns random canned response

## API Contracts

### 1. Conversations Management

#### GET /api/conversations
**Purpose**: Get all conversations for the user
**Response**:
```json
{
  "conversations": [
    {
      "id": "string",
      "title": "string",
      "preview": "string",
      "timestamp": "ISO date string",
      "messageCount": "number"
    }
  ]
}
```

#### GET /api/conversations/:id/messages
**Purpose**: Get all messages in a conversation
**Response**:
```json
{
  "messages": [
    {
      "id": "string",
      "role": "user|assistant",
      "content": "string",
      "timestamp": "ISO date string"
    }
  ]
}
```

#### POST /api/conversations
**Purpose**: Create new conversation
**Request**:
```json
{
  "title": "string"
}
```
**Response**:
```json
{
  "id": "string",
  "title": "string",
  "timestamp": "ISO date string"
}
```

#### DELETE /api/conversations/:id
**Purpose**: Delete a conversation
**Response**:
```json
{
  "success": true,
  "message": "Conversation deleted"
}
```

### 2. Chat/Messages

#### POST /api/chat
**Purpose**: Send message and get AI response
**Request**:
```json
{
  "conversationId": "string",
  "message": "string"
}
```
**Response**:
```json
{
  "userMessage": {
    "id": "string",
    "role": "user",
    "content": "string",
    "timestamp": "ISO date string"
  },
  "aiMessage": {
    "id": "string",
    "role": "assistant",
    "content": "string",
    "timestamp": "ISO date string"
  }
}
```

## Backend Implementation Plan

### 1. Database Models (MongoDB)

#### Conversation Model
```python
{
  "_id": ObjectId,
  "title": str,
  "preview": str,
  "timestamp": datetime,
  "userId": str  # For future user auth
}
```

#### Message Model
```python
{
  "_id": ObjectId,
  "conversationId": str,
  "role": str,  # "user" or "assistant"
  "content": str,
  "timestamp": datetime
}
```

### 2. AI Integration
- Use **Emergent LLM Key** with OpenAI via emergentintegrations
- Model: gpt-4 or latest available
- Streaming support for real-time responses (future enhancement)

### 3. Backend Routes to Implement
1. `GET /api/conversations` - List all conversations
2. `GET /api/conversations/:id/messages` - Get messages
3. `POST /api/conversations` - Create new conversation
4. `DELETE /api/conversations/:id` - Delete conversation
5. `POST /api/chat` - Send message & get AI response

### 4. Frontend Integration Changes

#### Files to Update:
1. **src/pages/Chat.jsx**
   - Replace mock data loading with API calls
   - Update `handleSendMessage` to call `/api/chat`
   - Update `handleNewChat` to call `/api/conversations`
   - Load conversations from `/api/conversations`
   - Load messages from `/api/conversations/:id/messages`

2. **Remove src/mock.js** after backend integration

#### API Service Layer
Create `src/services/api.js`:
```javascript
const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const conversationAPI = {
  getAll: () => axios.get(`${API_BASE}/conversations`),
  getMessages: (id) => axios.get(`${API_BASE}/conversations/${id}/messages`),
  create: (title) => axios.post(`${API_BASE}/conversations`, { title }),
  delete: (id) => axios.delete(`${API_BASE}/conversations/${id}`)
};

export const chatAPI = {
  sendMessage: (conversationId, message) => 
    axios.post(`${API_BASE}/chat`, { conversationId, message })
};
```

## Testing Plan
1. Test conversation creation
2. Test message sending and AI responses
3. Test conversation history loading
4. Test conversation deletion
5. Verify AI responses are contextual and relevant

## Notes
- All AI responses currently mocked in frontend
- Backend will use Emergent LLM key for OpenAI
- No authentication implemented yet (future enhancement)
- Messages stored in MongoDB for persistence
