import { useState } from 'react';
import './MessageInput.css';

function MessageInput({ onSendMessage, isConnected }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !isConnected) {
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
        disabled={!isConnected}
        className="message-input"
      />
      <button
        type="submit"
        disabled={!isConnected || !message.trim()}
        className="send-button"
      >
        Send
      </button>
    </form>
  );
}

export default MessageInput;
