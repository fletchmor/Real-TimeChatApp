package server

import (
	"github.com/fletchmor/Real-TimeChatApp/handler"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"golang.org/x/net/websocket"
)

func LoadRoutes() *chi.Mux {
	router := chi.NewRouter()

	router.Use(middleware.Logger)
	router.Handle("/ws", websocket.Handler(handler.WSHandler))

	return router
}
