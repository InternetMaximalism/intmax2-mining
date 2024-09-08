use intmax2_zkp::{
    common::{deposit::Deposit, salt::Salt, trees::deposit_tree::DepositMerkleProof},
    ethereum_types::{address::Address, bytes32::Bytes32, u256::U256},
    utils::poseidon_hash_out::PoseidonHashOut,
};
use mining_circuit::{
    claim::mining_claim::MiningClaim,
    eligible_tree::{EligibleLeaf, EligibleMerkleProof},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaimInput {
    deposit_tree_root: Bytes32,
    deposit_index: u32,
    deposit_merkle_proof: DepositMerkleProof,
    deposit: Deposit,
    eligible_tree_root: PoseidonHashOut,
    eligible_index: u32,
    eligible_merkle_proof: EligibleMerkleProof,
    eligible_leaf: EligibleLeaf,
    pubkey: U256,
    salt: Salt,
    recipient: Address,
}

pub struct ClaimOutput {
    pub claim_chain: Vec<MiningClaim>,
}
