package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"

	"example.com/m/app"
	"example.com/m/handlers"
	"github.com/go-redis/redis/v8"
)

func main() {
	circuitName := flag.String("circuit", "", "circuit name")
	flag.Parse()
	
	if *circuitName == "" {
		log.Fatal("Please provide circuit name")
		os.Exit(1)
	}

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT environment variable is not set")
		os.Exit(1)
	}

	redisURL := os.Getenv("REDIS_URL")
    if redisURL == "" {
        log.Fatal("REDIS_URL environment variable is not set")
        return
    }
    opt, err := redis.ParseURL(redisURL)
    if err != nil {
        log.Fatal("Redis URL parsing error:", err)
        return
    }

    rdb := redis.NewClient(opt)
    ctx := context.Background()

    // Test connection
    _, err = rdb.Ping(ctx).Result()
    if err != nil {
        log.Fatal("Redis connection error:", err)
        return
    }

	data := app.InitCircuitData(*circuitName)
	state := & app.State{
		CircuitData: &data,
		RedisClient: rdb,
	}
	
	http.HandleFunc("/health", handlers.HealthHandler)
	http.HandleFunc("/start-proof", withState(state, handlers.StartProof))
	http.HandleFunc("/get-proof", withState(state, handlers.GetProof))
	log.Println("Server is running on port " + port)
	if err := http.ListenAndServe(":" + port, nil); err != nil {
		panic(err)
	}
}

func withState(s *app.State, handler func(*app.State, http.ResponseWriter, *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		handler(s, w, r)
	}
}