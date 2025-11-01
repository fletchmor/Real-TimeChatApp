# Real-Time Chat Application

A full-stack real-time chat application with WebSocket support, built with Go (backend) and React (frontend).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go Version](https://img.shields.io/badge/go-1.25+-blue.svg)
![Node Version](https://img.shields.io/badge/node-16+-green.svg)

## Features

- **Real-time messaging** - Instant message delivery using WebSocket connections
- **User management** - Track online users in real-time
- **Auto-reconnect** - Automatic reconnection on connection loss
- **Responsive UI** - Works seamlessly on desktop and mobile
- **Modern tech stack** - Go backend with React frontend
- **CORS support** - Cross-origin resource sharing enabled
- **Clean architecture** - Separation of concerns with organized code structure

## Tech Stack

### Backend
- **Go 1.25+** - High-performance backend
- **Chi Router** - Lightweight HTTP router
- **WebSocket (golang.org/x/net/websocket)** - Real-time communication
- **UUID** - Unique user identification
- **godotenv** - Environment variable management

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **WebSocket API** - Native browser WebSocket support
- **CSS3** - Modern styling with CSS variables

## Prerequisites

- **Go 1.25 or higher** - [Download Go](https://golang.org/dl/)
- **Node.js 16+ and npm** - [Download Node.js](https://nodejs.org/)
- **Git** - For cloning the repository

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/fletchmor/Real-TimeChatApp.git
cd chatapp
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration

### 3. Install dependencies

**Backend (Go modules):**
```bash
go mod download
```

**Frontend (npm):**
```bash
npm install
```

## Running the Application

You'll need to run both the backend and frontend servers.

### Option 1: Run in separate terminals

**Terminal 1 - Backend:**
```bash
go run cmd/main.go
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Run with background process

```bash
# Run backend in background
go run cmd/main.go &

# Run frontend in foreground
npm run dev
```

## Usage

1. Enter a username (3-20 characters)
2. Click "Join Chat"
3. Start sending messages!
4. Open multiple browser tabs/windows to simulate multiple users

## Project Structure

```
chatapp/
├── cmd/
│   └── main.go              # Application entry point
├── server/
│   ├── server.go            # Server configuration
│   └── routes.go            # Route definitions
├── handler/
│   └── handler.go           # WebSocket handlers and business logic
├── documentation/
│   ├── API.md               # API documentation
├── src/                     # Frontend React application
│   ├── components/          # React components
│   │   ├── Chat.jsx        # Message display
│   │   ├── Login.jsx       # Login form
│   │   ├── MessageInput.jsx # Message input
│   │   └── UserList.jsx    # Online users list
│   ├── hooks/
│   │   └── useWebSocket.js # WebSocket connection hook
│   ├── config/
│   │   └── config.js       # Frontend configuration
│   ├── App.jsx             # Main app component
│   └── main.jsx            # React entry point
├── go.mod                   # Go dependencies
├── package.json             # Node dependencies
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Example environment variables
└── README.md               # This file
```

## API Documentation

See [documentation/API.md](documentation/API.md) for detailed API and WebSocket message format documentation.

## Development

### Backend Development

The Go backend uses:
- **Chi router** for HTTP routing and middleware
- **WebSocket** for real-time bidirectional communication
- **Mutex locks** for thread-safe user management

### Frontend Development

The React frontend uses:
- **Custom hooks** for WebSocket management
- **Component-based architecture** for modularity
- **CSS modules** for scoped styling

### Running Tests

**Backend:**
```bash
go test ./...
```

**Frontend:**
```bash
npm test
```

### Linting

**Backend:**
```bash
go vet ./...
```

**Frontend:**
```bash
npm run lint
```

### Building for Production

**Backend:**
```bash
go build -o chatapp cmd/main.go
./chatapp
```

**Frontend:**
```bash
npm run build
npm run preview
```

### WebSocket connection fails
- Check browser console for errors
- Verify CORS headers are set correctly
- Ensure firewall isn't blocking WebSocket connections

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Add user authentication (JWT)
- [ ] Implement private messaging
- [ ] Add message persistence (database)
- [ ] File/image sharing
- [ ] Typing indicators
- [ ] Message reactions
- [ ] User profiles and avatars
- [ ] Chat rooms/channels
- [ ] Message search functionality
- [ ] Dark/light theme toggle

## Authors

[fletchmor](https://github.com/fletchmor)

## Acknowledgments

- Chi router for elegant HTTP routing
- React team for the amazing frontend framework
- Vite for blazing fast development experience
- The Go community for excellent WebSocket support

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---