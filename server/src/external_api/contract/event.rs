use std::sync::Arc;

use anyhow::Result;
use ethers::{
    providers::Middleware,
    types::{Address, Filter, H256, U256},
};

#[derive(Debug, Clone)]
pub struct DepositEvent {
    pub block_number: u64,
    pub leaf_index: u32,
    pub leaf_hash: H256,
    pub pubkey_salt_hash: H256,
    pub token_index: u32,
    pub amount: U256,
}

pub async fn get_deposit_events<M: Middleware + 'static>(
    client: &Arc<M>,
    contract_address: Address,
    from_block: u64,
) -> Result<Vec<DepositEvent>> {
    let filter = Filter::new()
        .address(contract_address)
        .event("Deposited(uint32,bytes32,bytes32,uint32,uint256)")
        .from_block(from_block);
    let logs = client.get_logs(&filter).await?;
    let mut deposit_events = Vec::new();
    for log in logs {
        let block_number = log.block_number.unwrap().as_u64();
        let leaf_index = U256::from_big_endian(log.topics[1].as_bytes());
        let leaf_hash = H256::from_slice(&log.data[..32]);
        let pubkey_salt_hash = H256::from_slice(&log.data[32..64]);
        let token_index = U256::from_big_endian(&log.data[64..96]);
        let amount = U256::from_big_endian(&log.data[96..128]);
        deposit_events.push(DepositEvent {
            block_number,
            leaf_index: leaf_index.as_u32(),
            leaf_hash,
            pubkey_salt_hash,
            token_index: token_index.as_u32(),
            amount,
        });
    }
    // sort by block_number
    deposit_events.sort_by_key(|event| event.block_number);
    Ok(deposit_events)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{env::load_env, external_api::contract::utils::get_client};
    use anyhow::{Ok, Result};

    #[tokio::test]
    async fn test_get_deposit_events() -> Result<()> {
        let client = get_client().await?;
        let contract_address: Address = load_env().int0_main_contract_address.parse()?;
        let instant = std::time::Instant::now();
        let events = get_deposit_events(&client, contract_address, 0).await?;
        println!("elapsed: {:?}", instant.elapsed());
        for event in events {
            println!("{:?}", event);
        }
        Ok(())
    }
}
