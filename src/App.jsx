import { useWebSocket } from './hooks/useWebSocket';
import Login from './components/Login';
import Chat from './components/Chat';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';
import './App.css';

function App() {
  const {
    messages,
    users,
    isConnected,
    currentUser,
    connect,
    sendMessage,
    disconnect,
  } = useWebSocket();

  const handleLogin = (username) => {
    connect(username);
  };

  const handleLogout = () => {
    disconnect();
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Real-Time Chat</h1>
        <div className="header-info">
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
          <span className="current-user">@{currentUser}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="chat-container">
        <div className="chat-main">
          <Chat messages={messages} currentUser={currentUser} />
          <MessageInput onSendMessage={sendMessage} isConnected={isConnected} />
        </div>

        <aside className="chat-sidebar">
          <UserList users={users} currentUser={currentUser} />
        </aside>
      </div>
    </div>
  );
}

export default App;
