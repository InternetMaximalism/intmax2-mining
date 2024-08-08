use ethers::types::H256;
use intmax2_zkp::ethereum_types::{bytes32::Bytes32, u256::U256, u32limb_trait::U32LimbTrait};

use super::event::DepositEvent;

pub fn from_ether_h256_to_intmax_bytes32(h256: H256) -> Bytes32 {
    Bytes32::from_bytes_be(&h256[..])
}

pub fn from_ether_u256_to_intmax_u256(u256: ethers::types::U256) -> U256 {
    let mut bytes = [0u8; 32];
    u256.to_big_endian(&mut bytes);
    U256::from_bytes_be(&bytes)
}

pub fn from_intmax_h256_to_ether_bytes32(h256: Bytes32) -> H256 {
    H256::from_slice(&h256.to_bytes_be())
}

pub fn from_intmax_u256_to_ether_u256(u256: U256) -> ethers::types::U256 {
    ethers::types::U256::from_big_endian(&u256.to_bytes_be())
}

#[derive(Debug, Clone)]
pub struct DepositEventIntmax {
    pub block_number: u64,
    pub leaf_index: u32,
    pub leaf_hash: Bytes32,
    pub pubkey_salt_hash: Bytes32,
    pub token_index: u32,
    pub amount: U256,
}

impl From<DepositEvent> for DepositEventIntmax {
    fn from(event: DepositEvent) -> Self {
        Self {
            block_number: event.block_number,
            leaf_index: event.leaf_index,
            leaf_hash: from_ether_h256_to_intmax_bytes32(event.leaf_hash),
            pubkey_salt_hash: from_ether_h256_to_intmax_bytes32(event.pubkey_salt_hash),
            token_index: event.token_index,
            amount: from_ether_u256_to_intmax_u256(event.amount),
        }
    }
}
