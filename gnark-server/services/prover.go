package services

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"

	"example.com/m/app"
	"example.com/m/circuit"
	"example.com/m/models"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/frontend"
	"github.com/qope/gnark-plonky2-verifier/types"
	"github.com/qope/gnark-plonky2-verifier/variables"

	plonk_bn254 "github.com/consensys/gnark/backend/plonk/bn254"
	"github.com/consensys/gnark/backend/witness"
)

func Prove(ctx context.Context, s *app.State, jobId string, proofRaw types.ProofWithPublicInputsRaw) error {
	log.Printf("Starting Prove for jobId: %s", jobId)

	witness, err := prepareWitness(s, proofRaw)
	if err != nil {
		return handleError(ctx, s, jobId, "Failed to prepare witness", err)
	}

	proof, err := generateProof(s, witness)
	if err != nil {
		return handleError(ctx, s, jobId, "Failed to generate proof", err)
	}

	result, err := prepareResult(*proof, witness)
	if err != nil {
		return handleError(ctx, s, jobId, "Failed to prepare result", err)
	}

	if err := SetStatus(ctx, s, jobId, models.Status{Status: "done", Result: result}); err != nil {
		log.Printf("Failed to set final status for jobId %s: %v", jobId, err)
		return err
	}

	log.Printf("Prove completed successfully for jobId: %s", jobId)
	return nil
}

func prepareWitness(s *app.State, proofRaw types.ProofWithPublicInputsRaw) (witness.Witness, error) {
	proofWithPis := variables.DeserializeProofWithPublicInputs(proofRaw)
	assignment := circuit.VerifierCircuit{
		Proof:                   proofWithPis.Proof,
		PublicInputs:            proofWithPis.PublicInputs,
		VerifierOnlyCircuitData: s.CircuitData.VerifierOnlyCircuitData,
	}
	return frontend.NewWitness(&assignment, ecc.BN254.ScalarField())
}

func generateProof(s *app.State, witness witness.Witness) (*plonk_bn254.Proof, error) {
	return plonk_bn254.Prove(&s.CircuitData.Ccs, &s.CircuitData.Pk, witness)
}

func prepareResult(proof plonk_bn254.Proof, witness witness.Witness) (models.ProveResult, error) {
	proofHex := hex.EncodeToString(proof.MarshalSolidity())
	publicInputs, err := ExtractPublicInputs(witness)
	if err != nil {
		return models.ProveResult{}, err
	}

	publicInputsStr := make([]string, len(publicInputs))
	for i, bi := range publicInputs {
		publicInputsStr[i] = bi.String()
	}

	return models.ProveResult{
		PublicInputs: publicInputsStr,
		Proof:        proofHex,
	}, nil
}

func handleError(ctx context.Context, s *app.State, jobId, message string, err error) error {
	fullErr := fmt.Errorf("%s: %w", message, err)
	log.Printf("Error in Prove for jobId %s: %v", jobId, fullErr)
	if setErr := SetStatus(ctx, s, jobId, models.Status{Status: "error"}); setErr != nil {
		log.Printf("Failed to set error status for jobId %s: %v", jobId, setErr)
	}
	return fullErr
}
