use std::time::SystemTime;

use intmax2_zkp::{
    common::{deposit::Deposit, salt::Salt, trees::deposit_tree::DepositMerkleProof},
    ethereum_types::{address::Address, bytes32::Bytes32, u256::U256},
};
use mining_circuit::{
    claim::{claim_circuit::ClaimPublicInputs, mining_claim::MiningClaim},
    eligible_tree::{EligibleLeaf, EligibleMerkleProof},
};
use num_bigint::BigUint;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaimInput {
    pub deposit_tree_root: Bytes32,
    pub eligible_tree_root: Bytes32,
    pub claims: Vec<SingleClaimInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SingleClaimInput {
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
    pub pis_vec: Vec<u32>,
    pub proof: Vec<u8>,
}

pub struct ProveStatus {
    pub requested_at: SystemTime,
    pub completed_at: Option<SystemTime>,
    pub claim_output: Option<ClaimOutput>,
    pub error: Option<String>,
}
