package server

import (
	"net/http"

	"github.com/fletchmor/Real-TimeChatApp/handler"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"golang.org/x/net/websocket"
)

func LoadRoutes() *chi.Mux {
	router := chi.NewRouter()

	// CORS middleware
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// Only apply logger to non-websocket routes
	router.Group(func(r chi.Router) {
		r.Use(middleware.Logger)
	})

	// WebSocket route without logger middleware
	router.Handle("/ws", websocket.Handler(handler.WSHandler))

	return router
}
