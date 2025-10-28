package main

import (
	"context"

	"github.com/fletchmor/Real-TimeChatApp/server"
)

func main() {
	r := server.CreateRouter()
	r.Start(context.Background())
}
