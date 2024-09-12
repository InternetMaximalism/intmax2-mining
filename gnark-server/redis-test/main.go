package main

import (
	"context"
	"fmt"
	"os"

	"github.com/go-redis/redis/v8"
)

func main() {
    // Get Redis URL from environment variable
    redisURL := os.Getenv("REDIS_URL")
    if redisURL == "" {
        fmt.Println("REDIS_URL environment variable is not set")
        return
    }

    // Parse options from Redis URL and create client
    opt, err := redis.ParseURL(redisURL)
    if err != nil {
        fmt.Println("Redis URL parsing error:", err)
        return
    }
    rdb := redis.NewClient(opt)
    ctx := context.Background()

    // Test connection
    pong, err := rdb.Ping(ctx).Result()
    if err != nil {
        fmt.Println("Redis connection error:", err)
        return
    }
    fmt.Println("Redis connection successful:", pong)

    // Perform Redis operations below
    // Set key and value
    err = rdb.Set(ctx, "mykey", "Hello Redis", 1000000).Err()
    if err != nil {
        fmt.Println("Set error:", err)
        return
    }

    // Get value
    val, err := rdb.Get(ctx, "mykey").Result()
    if err != nil {
        fmt.Println("Get error:", err)
        return
    }
    fmt.Println("mykey:", val)
}