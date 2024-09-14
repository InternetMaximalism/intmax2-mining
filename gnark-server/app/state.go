package app

import "github.com/go-redis/redis/v8"

type State struct {
	CircuitData *CircuitData
	RedisClient *redis.Client
}
