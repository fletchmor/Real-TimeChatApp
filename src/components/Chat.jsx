import { useEffect, useRef } from 'react';
import './Chat.css';

function Chat({ messages, currentUser }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.isSystem ? 'system-message' : ''} ${
              msg.username === currentUser ? 'own-message' : ''
            }`}
          >
            {msg.isSystem ? (
              <div className="system-text">{msg.message}</div>
            ) : (
              <>
                <div className="message-header">
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default Chat;
