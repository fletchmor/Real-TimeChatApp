import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL } from '../config/config';

// Message types matching the backend
const MESSAGE_TYPES = {
  NEW_USER: 'newUser',
  BROADCAST: 'broadcastMessage',
  USER_LIST: 'userList',
};

export const useWebSocket = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback((username) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected to:', WS_URL);
        setIsConnected(true);

        // Send new user message
        const newUserMessage = {
          messagetype: MESSAGE_TYPES.NEW_USER,
          username: username,
        };
        console.log('📤 Sending new user message:', newUserMessage);
        ws.send(JSON.stringify(newUserMessage));
        setCurrentUser(username);
      };

      ws.onmessage = (event) => {
        console.log('📨 Raw message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Parsed message:', data);

          if (data.messagetype === MESSAGE_TYPES.USER_LIST) {
            console.log('👥 User list received:', data.users);
            // Set the complete user list
            setUsers(data.users || []);
          } else if (data.messagetype === MESSAGE_TYPES.NEW_USER) {
            console.log('👤 New user message:', data);
            // Add new user to the list if not already present
            setUsers(prevUsers => {
              console.log('Current users:', prevUsers);
              const exists = prevUsers.some(u => u.username === data.username);
              if (!exists) {
                const newUsers = [...prevUsers, { userId: Date.now(), username: data.username }];
                console.log('Updated users:', newUsers);
                return newUsers;
              }
              return prevUsers;
            });

            // Add system message for new user
            setMessages(prev => {
              const newMsg = {
                id: Date.now(),
                username: 'System',
                message: `${data.username} joined the chat`,
                timestamp: new Date().toISOString(),
                isSystem: true,
              };
              console.log('Adding system message:', newMsg);
              return [...prev, newMsg];
            });
          } else if (data.messagetype === MESSAGE_TYPES.BROADCAST) {
            console.log('💬 Broadcast message:', data);
            // Add regular message
            setMessages(prev => {
              const newMsg = {
                id: Date.now() + Math.random(),
                username: data.username,
                message: data.payload,
                timestamp: new Date().toISOString(),
                isSystem: false,
              };
              console.log('Adding message:', newMsg);
              return [...prev, newMsg];
            });
          } else {
            console.warn('Unknown message type:', data.messagetype);
          }
        } catch (error) {
          console.error('Error parsing message:', error, event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (currentUser) {
            connect(currentUser);
          }
        }, 3000);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, [currentUser]);

  const sendMessage = useCallback((message) => {
    console.log('📤 Attempting to send message:', message);
    console.log('WebSocket state:', wsRef.current?.readyState, 'Current user:', currentUser);
    if (wsRef.current?.readyState === WebSocket.OPEN && currentUser) {
      const broadcastMessage = {
        messagetype: MESSAGE_TYPES.BROADCAST,
        username: currentUser,
        payload: message,
      };
      console.log('📤 Sending message:', broadcastMessage);
      wsRef.current.send(JSON.stringify(broadcastMessage));
    } else {
      console.error('Cannot send message - WebSocket not open or no user');
    }
  }, [currentUser]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setCurrentUser(null);
    setMessages([]);
    setUsers([]);
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    messages,
    users,
    isConnected,
    currentUser,
    connect,
    sendMessage,
    disconnect,
  };
};
