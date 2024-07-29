package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"

	"example.com/m/context"
	"example.com/m/handlers"
)

func main() {
	circuitName := flag.String("circuit", "", "circuit name")
	flag.Parse()
	
	if *circuitName == "" {
		fmt.Println("Please provide circuit name")
		os.Exit(1)
	}

	ctx := handlers.CircuitData(context.InitCircuitData(*circuitName))
	http.HandleFunc("/health", handlers.HealthHandler)
	http.HandleFunc("/start-proof", ctx.StartProof)
	http.HandleFunc("/get-proof", ctx.GetProof)
	println("Server is running on port 8058...")
	if err := http.ListenAndServe(":8058", nil); err != nil {
		panic(err)
	}
}