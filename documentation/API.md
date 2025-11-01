# API Documentation

This document describes the WebSocket API for the Real-Time Chat Application.

## Table of Contents

- [Connection](#connection)
- [Message Types](#message-types)
- [Client → Server Messages](#client--server-messages)
- [Server → Client Messages](#server--client-messages)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Connection

### WebSocket Endpoint

```
ws://localhost:PORT/ws
```

Replace `PORT` with the port specified in your `.env` file (default: 8080).

### Connection Process

1. Client establishes WebSocket connection to `/ws` endpoint
2. Server accepts connection and waits for initial message
3. Client sends `newUser` message with username
4. Server responds with current user list
5. Server broadcasts `newUser` message to all connected clients
6. Connection is maintained for bidirectional communication

### Connection Headers

No special headers required. Standard WebSocket upgrade request.

```http
GET /ws HTTP/1.1
Host: localhost:PORT
Upgrade: websocket
Connection: Upgrade
```

## Message Types

All messages are JSON-encoded strings with a `messagetype` field that identifies the message type.

### Message Type Constants

| Type | Value | Direction | Description |
|------|-------|-----------|-------------|
| New User | `newUser` | Bidirectional | User joins the chat |
| Broadcast Message | `broadcastMessage` | Bidirectional | Regular chat message |
| User List | `userList` | Server → Client | List of all connected users |

## Client → Server Messages

### New User Message

Sent when a user first connects to the chat.

**Message Type:** `newUser`

**Format:**
```json
{
  "messagetype": "newUser",
  "username": "string"
}
```

**Fields:**
- `messagetype` (string, required): Must be `"newUser"`
- `username` (string, required): Username for the new user

**Example:**
```json
{
  "messagetype": "newUser",
  "username": "john_doe"
}
```

**Server Response:**
1. User is added to the global user list
2. Server sends `userList` message to the new user
3. Server broadcasts `newUser` message to all clients

---

### Broadcast Message

Sent when a user sends a chat message.

**Message Type:** `broadcastMessage`

**Format:**
```json
{
  "messagetype": "broadcastMessage",
  "username": "string",
  "payload": "string"
}
```

**Fields:**
- `messagetype` (string, required): Must be `"broadcastMessage"`
- `username` (string, required): Username of the sender
- `payload` (string, required): The message content

**Example:**
```json
{
  "messagetype": "broadcastMessage",
  "username": "john_doe",
  "payload": "Hello, everyone!"
}
```

**Server Response:**
- Server broadcasts the message to all connected clients

## Server → Client Messages

### New User Message

Broadcast to all clients when a new user joins.

**Message Type:** `newUser`

**Format:**
```json
{
  "messagetype": "newUser",
  "username": "string"
}
```

**Fields:**
- `messagetype` (string): Will be `"newUser"`
- `username` (string): Username of the user who joined

**Example:**
```json
{
  "messagetype": "newUser",
  "username": "jane_smith"
}
```

**Client Action:**
- Display system message: "{username} joined the chat"
- Update online users list

---

### Broadcast Message

Sent to all clients when a user sends a message.

**Message Type:** `broadcastMessage`

**Format:**
```json
{
  "messagetype": "broadcastMessage",
  "username": "string",
  "payload": "string"
}
```

**Fields:**
- `messagetype` (string): Will be `"broadcastMessage"`
- `username` (string): Username of the message sender
- `payload` (string): The message content

**Example:**
```json
{
  "messagetype": "broadcastMessage",
  "username": "john_doe",
  "payload": "Hello, everyone!"
}
```

**Client Action:**
- Display message in chat window with username and content

---

### User List Message

Sent to a user when they first connect, containing all currently connected users.

**Message Type:** `userList`

**Format:**
```json
{
  "messagetype": "userList",
  "users": [
    {
      "userId": 123456,
      "username": "string"
    }
  ]
}
```

**Fields:**
- `messagetype` (string): Will be `"userList"`
- `users` (array): Array of user objects
  - `userId` (number): Unique identifier for the user
  - `username` (string): Username of the user

**Example:**
```json
{
  "messagetype": "userList",
  "users": [
    {
      "userId": 123456789,
      "username": "john_doe"
    },
    {
      "userId": 987654321,
      "username": "jane_smith"
    }
  ]
}
```

**Client Action:**
- Replace current user list with the received list
- Display all users in the UI

## Error Handling

### Connection Errors

If the WebSocket connection fails:
- Client should implement exponential backoff for reconnection attempts
- The reference implementation reconnects after 3 seconds

### Message Parsing Errors

If the server receives a malformed message:
- The connection will be closed
- User will be removed from the user list
- Error will be logged on server side

### Disconnection

When a client disconnects:
- Server automatically removes the user from the global user list
- No notification is sent to other clients (feature could be added)
- Connection resources are cleaned up

## Examples

### Complete Connection Flow

**1. Client connects and sends new user message:**
```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onopen = () => {
  const message = {
    messagetype: 'newUser',
    username: 'john_doe'
  };
  ws.send(JSON.stringify(message));
};

// Note: Replace localhost:8080 with your actual server address
```

**2. Server responds with user list:**
```json
{
  "messagetype": "userList",
  "users": [
    {
      "userId": 123456789,
      "username": "jane_smith"
    },
    {
      "userId": 234567890,
      "username": "john_doe"
    }
  ]
}
```

**3. Server broadcasts new user to all clients:**
```json
{
  "messagetype": "newUser",
  "username": "john_doe"
}
```

**4. Client sends a message:**
```javascript
const message = {
  messagetype: 'broadcastMessage',
  username: 'john_doe',
  payload: 'Hello everyone!'
};
ws.send(JSON.stringify(message));
```

**5. Server broadcasts to all clients:**
```json
{
  "messagetype": "broadcastMessage",
  "username": "john_doe",
  "payload": "Hello everyone!"
}
```

### JavaScript Client Example

```javascript
class ChatClient {
  constructor(url, username) {
    this.url = url;
    this.username = username;
    this.ws = null;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to chat server');
      this.sendNewUser();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from chat server');
      // Reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };
  }

  sendNewUser() {
    const message = {
      messagetype: 'newUser',
      username: this.username
    };
    this.ws.send(JSON.stringify(message));
  }

  sendMessage(text) {
    const message = {
      messagetype: 'broadcastMessage',
      username: this.username,
      payload: text
    };
    this.ws.send(JSON.stringify(message));
  }

  handleMessage(data) {
    switch (data.messagetype) {
      case 'userList':
        console.log('Current users:', data.users);
        break;
      case 'newUser':
        console.log(`${data.username} joined the chat`);
        break;
      case 'broadcastMessage':
        console.log(`${data.username}: ${data.payload}`);
        break;
      default:
        console.warn('Unknown message type:', data.messagetype);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage
const client = new ChatClient('ws://localhost:8080/ws', 'john_doe');
client.connect();

// Send a message
client.sendMessage('Hello, world!');

// Disconnect
client.disconnect();
```

## Rate Limiting

Currently, there is no rate limiting implemented. This could be added in future versions to prevent spam and abuse.

## Security Considerations

1. **No Authentication**: The current implementation does not include user authentication
2. **Username Validation**: Username validation should be implemented client-side and server-side
3. **Message Sanitization**: Messages are not sanitized for XSS - implement proper escaping
4. **CORS**: Currently allows all origins (`*`) - should be restricted in production
5. **TLS/SSL**: Use `wss://` in production instead of `ws://`

## Future Improvements

- Add user authentication with JWT tokens
- Implement message history/persistence
- Add typing indicators
- Support for private messages
- User presence updates (join/leave notifications)
- Message read receipts
- File upload support
- Rate limiting per user
- Message encryption
