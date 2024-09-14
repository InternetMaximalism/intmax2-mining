package services

import (
	"context"
	"encoding/json"
	"time"

	"example.com/m/app"
	"example.com/m/models"
)

func SetStatus(ctx context.Context, s *app.State, jobId string, status models.Status) error {
	statusJSON, err := json.Marshal(status)
	if err != nil {
		return err
	}
	return s.RedisClient.Set(ctx, jobId, statusJSON, 1*time.Minute).Err()
}

func GetStatus(ctx context.Context, s *app.State, jobId string) (models.Status, error) {
	var status models.Status
	statusJSON, err := s.RedisClient.Get(ctx, jobId).Result()
	if err != nil {
		return status, err
	}
	err = json.Unmarshal([]byte(statusJSON), &status)
	return status, err
}
