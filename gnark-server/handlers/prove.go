package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"example.com/m/app"
	"example.com/m/models"
	"example.com/m/services"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/qope/gnark-plonky2-verifier/types"
)

func StartProof(s *app.State, w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_jobId, err := uuid.NewRandom()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jobId := _jobId.String()
	var input types.ProofWithPublicInputsRaw
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	services.SetStatus( ctx, s, jobId, models.Status{Status: "in progress"})

	proveCtx := context.Background()
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Panic in Prove goroutine for job %s: %v", jobId, r)
				services.SetStatus(ctx, s, jobId, models.Status{Status: "failed", ErrorMessage: fmt.Sprintf("%v", r)})
			}
		}()
		services.Prove(proveCtx, s, jobId, input)
	}()

	json.NewEncoder(w).Encode(map[string]string{"jobId": jobId})
	log.Println("StartProof", jobId)
}

func GetProof(s *app.State, w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	jobId := r.URL.Query().Get("jobId")
	log.Println("GetProof", jobId)
	_, err := uuid.Parse(jobId)
	if err != nil {
		http.Error(w, "Invalid JobId", http.StatusBadRequest)
		return
	}
	status, err := services.GetStatus(ctx, s, jobId)
	if err == redis.Nil {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(status)
}
