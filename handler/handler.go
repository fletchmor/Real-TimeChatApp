package handler

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/google/uuid"
	"golang.org/x/net/websocket"
)

type User struct {
	UserID   int
	Username string
	conn     *websocket.Conn
}

type Users struct {
	connections []User
	mu          sync.Mutex
}

type WsServer struct {
	conn  *websocket.Conn
	users *Users
}

type MessageType string

const (
	NewUserType          MessageType = "newUser"
	BroadcastMessageType MessageType = "broadcastMessage"
	UserListType         MessageType = "userList"
)

type BaseMessage struct {
	MessageType MessageType `json:"messagetype"`
}

type BroadcastMessage struct {
	BaseMessage
	Username string `json:"username"`
	Payload  string `json:"payload"`
}

type NewUserMessage struct {
	BaseMessage
	Username string `json:"username"`
}

type UserInfo struct {
	UserID   int    `json:"userId"`
	Username string `json:"username"`
}

type UserListMessage struct {
	BaseMessage
	Users []UserInfo `json:"users"`
}

var globalUsers = Users{connections: make([]User, 0)}

func newUser(ws *websocket.Conn, username string) User {
	user := User{
		UserID:   int(uuid.New().ID()),
		Username: username,
		conn:     ws,
	}

	return user
}

func (u *Users) addUser(ws *websocket.Conn, Username string) {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.connections = append(u.connections, newUser(ws, Username))
}

func (u *Users) removeUser(ws *websocket.Conn) {
	u.mu.Lock()
	defer u.mu.Unlock()
	for i, user := range u.connections {
		if user.conn == ws {
			u.connections = append(u.connections[:i], u.connections[i+1:]...)
		}
	}
}

func (u *Users) sendUserList(ws *websocket.Conn) {
	u.mu.Lock()
	defer u.mu.Unlock()

	userInfos := make([]UserInfo, len(u.connections))
	for i, user := range u.connections {
		userInfos[i] = UserInfo{
			UserID:   user.UserID,
			Username: user.Username,
		}
	}

	userListMsg := UserListMessage{
		BaseMessage: BaseMessage{MessageType: UserListType},
		Users:       userInfos,
	}

	if err := websocket.JSON.Send(ws, userListMsg); err != nil {
		fmt.Println("Error sending user list:", err)
	}
}

func (u *Users) broadcast(message interface{}) {
	u.mu.Lock()

	switch message.(type) {
	case NewUserMessage, BroadcastMessage:
		// Valid message types
	default:
		fmt.Println("Wrong message type received")
		u.mu.Unlock()
		return
	}

	fmt.Println("Broadcasting to users: ", u.connections)

	// Collect failed connections while lock is held
	var failedConns []*websocket.Conn
	for _, user := range u.connections {
		if err := websocket.JSON.Send(user.conn, message); err != nil {
			failedConns = append(failedConns, user.conn)
			fmt.Println("Error sending message")
		}
	}
	u.mu.Unlock()

	// Remove failed connections after releasing the lock to avoid deadlock
	for _, conn := range failedConns {
		u.removeUser(conn)
	}
}

func WSHandler(ws *websocket.Conn) {
	var message string
	for {
		if err := websocket.Message.Receive(ws, &message); err != nil {
			fmt.Println("Error Occured: ", err)
			globalUsers.removeUser(ws)
			return
		}

		var parsedMessage BaseMessage
		if err := json.Unmarshal([]byte(message), &parsedMessage); err != nil {
			fmt.Println("failed to parse message: ", err)
			globalUsers.removeUser(ws)
			return
		}

		switch parsedMessage.MessageType {
		case NewUserType:
			var newUserMessage NewUserMessage
			if err := json.Unmarshal([]byte(message), &newUserMessage); err != nil {
				fmt.Println("Failed to parse new message: ", err)
				globalUsers.removeUser(ws)
				return
			}
			globalUsers.addUser(ws, newUserMessage.Username)
			// Send current user list to the new user
			globalUsers.sendUserList(ws)
			// Broadcast to everyone that a new user joined
			globalUsers.broadcast(newUserMessage)
			continue
		case BroadcastMessageType:
			var broadcastMsg BroadcastMessage
			if err := json.Unmarshal([]byte(message), &broadcastMsg); err != nil {
				fmt.Println("Failed to parse broadcast message: ", err)
				continue
			}
			globalUsers.broadcast(broadcastMsg)
		}

		fmt.Println("Message received: ", message)
	}
}
