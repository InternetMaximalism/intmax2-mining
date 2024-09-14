package models

type ProveResult struct {
	PublicInputs []string `json:"publicInputs"`
	Proof        string   `json:"proof"`
}

type Status struct {
	Status string      `json:"status"`
	ErrorMessage string    `json:"errorMessage,omitempty"`
	Result ProveResult `json:"result,omitempty"`
}
