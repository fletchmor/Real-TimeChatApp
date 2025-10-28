package server

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type Router struct {
	router http.Handler
}

func CreateRouter() *Router {
	r := &Router{
		router: LoadRoutes(),
	}

	return r
}

func (r *Router) Start(ctx context.Context) error {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading env file")
	}

	port := os.Getenv("PORT")

	server := &http.Server{
		Addr:    ":" + port,
		Handler: r.router,
	}

	err = server.ListenAndServe()
	if err != nil {
		log.Fatal("Something Went Wrong When Starting The Server")
	}

	return nil
}