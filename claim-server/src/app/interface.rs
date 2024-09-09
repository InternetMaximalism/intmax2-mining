use intmax2_zkp::{
    common::{deposit::Deposit, salt::Salt, trees::deposit_tree::DepositMerkleProof},
    ethereum_types::{address::Address, bytes32::Bytes32, u256::U256},
};
use mining_circuit::{
    claim::{claim_circuit::ClaimPublicInputs, mining_claim::MiningClaim},
    eligible_tree::{EligibleLeaf, EligibleMerkleProof},
};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HealthCheckResponse {
    pub message: String,
    pub timestamp: u128,
    pub uptime: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ErrorResponse {
    pub success: bool,
    pub code: u16,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaimRequest {
    pub deposit_tree_root: Bytes32,
    pub eligible_tree_root: Bytes32, // bytes32 representation of poseidon hash out
    pub claims: Vec<ClaimInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaimInput {
    pub deposit_index: u32,
    pub deposit_merkle_proof: DepositMerkleProof,
    pub deposit: Deposit,
    pub eligible_index: u32,
    pub eligible_merkle_proof: EligibleMerkleProof,
    pub eligible_leaf: EligibleLeaf,
    pub pubkey: U256,
    pub salt: Salt,
    pub recipient: Address,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaimOutput {
    pub claim_chain: Vec<MiningClaim>,
    pub pis: ClaimPublicInputs,
    pub proof: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaimIdQuery {
    pub ids: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProofResponse {
    pub success: bool,
    pub result: Option<ClaimOutput>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SingleResult {
    pub id: String,
    pub result: ClaimOutput,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProofsResponse {
    pub success: bool,
    pub results: Vec<SingleResult>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateProofResponse {
    pub success: bool,
    pub message: String,
    pub last_claim_hash: Bytes32,
    pub error_message: Option<String>,
}
