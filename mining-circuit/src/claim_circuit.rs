use intmax2_zkp::ethereum_types::{bytes32::Bytes32, u256::U256};

#[derive(Debug, Clone)]
pub struct ClaimPublicInputs {
    pub deposit_root: Bytes32,
    pub claimed_token: U256,
}
