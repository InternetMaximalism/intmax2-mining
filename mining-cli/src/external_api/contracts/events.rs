use std::collections::HashSet;

use ethers::{providers::Middleware as _, types::Address};
use intmax2_zkp::{
    common::deposit::Deposit,
    ethereum_types::{bytes32::Bytes32, u256::U256, u32limb_trait::U32LimbTrait},
    utils::leafable::Leafable,
};

use super::{
    int1::get_int1_contract,
    utils::{get_client, u256_as_bytes_be},
};

#[derive(Clone, Debug)]
pub struct Deposited {
    pub deposit_id: u64,
    pub sender: Address,
    pub recipient_salt_hash: Bytes32,
    pub token_index: u32,
    pub amount: U256,
    pub tx_nonce: Option<u64>,
    pub deposit_index: Option<u32>,
}

impl Deposited {
    pub fn deposit(&self) -> Deposit {
        Deposit {
            pubkey_salt_hash: self.recipient_salt_hash,
            token_index: self.token_index,
            amount: self.amount,
        }
    }
}

pub enum DepositQuery {
    FromBlock(u64),
    BySender(Address),
    ByDepositId(u32),
}

pub async fn get_deposited_event(query: DepositQuery) -> anyhow::Result<Vec<Deposited>> {
    let int1 = get_int1_contract().await?;
    let events = match query {
        DepositQuery::FromBlock(from_block) => {
            int1.deposited_filter()
                .from_block(from_block)
                .query_with_meta()
                .await?
        }
        DepositQuery::BySender(sender) => {
            int1.deposited_filter()
                .from_block(0)
                .topic2(sender)
                .query_with_meta()
                .await?
        }
        DepositQuery::ByDepositId(deposit_id) => {
            int1.deposited_filter()
                .from_block(0)
                .topic1(ethers::types::U256::from(deposit_id))
                .query_with_meta()
                .await?
        }
    };
    let client = get_client().await?;

    let mut deposited_events = Vec::new();
    for (event, meta) in events {
        // get tx_nonce if query is BySender because it is needed for getting deposit salt
        let tx_nonce = if let DepositQuery::BySender(_) = query {
            let tx_hash = meta.transaction_hash;
            let tx = client
                .get_transaction(tx_hash)
                .await?
                .expect("tx not found");
            Some(tx.nonce.as_u64())
        } else {
            None
        };
        deposited_events.push(Deposited {
            deposit_id: event.deposit_id.try_into().unwrap(),
            sender: event.sender,
            recipient_salt_hash: Bytes32::from_bytes_be(&event.recipient_salt_hash),
            token_index: event.token_index,
            amount: U256::from_bytes_be(&u256_as_bytes_be(event.amount)),
            tx_nonce,
            deposit_index: None, // set later
        });
    }

    deposited_events.sort_by_key(|event| event.deposit_id);
    Ok(deposited_events)
}

#[derive(Clone, Debug)]
pub struct DepositLeafInserted {
    pub deposit_index: u32,
    pub deposit_hash: Bytes32,
}

pub async fn get_deposit_leaf_inserted_event(
    from_block: u64,
) -> anyhow::Result<Vec<DepositLeafInserted>> {
    let int1 = get_int1_contract().await?;
    let events = int1
        .deposit_leaf_inserted_filter()
        .from_block(from_block)
        .query_with_meta()
        .await?;
    let events: Vec<DepositLeafInserted> = events
        .into_iter()
        .map(|(event, _meta)| DepositLeafInserted {
            deposit_index: event.deposit_index,
            deposit_hash: Bytes32::from_bytes_be(&event.deposit_hash),
        })
        .collect();
    Ok(events)
}

// get filtered deposited events that are actually inserted into the deposit tree
pub async fn get_effective_deposits(from_block: u64) -> anyhow::Result<Vec<Deposited>> {
    let deposited_events = get_deposited_event(DepositQuery::FromBlock(from_block)).await?;
    let deposit_leaf_inserted_events = get_deposit_leaf_inserted_event(from_block).await?;

    // Use HashSet for faster search
    let mut effective_deposit_hashes = HashSet::new();
    for event in deposit_leaf_inserted_events {
        effective_deposit_hashes.insert(event.deposit_hash);
    }

    let mut filtered_events = Vec::new();
    for event in deposited_events {
        let deposit_hash = event.deposit().hash();
        if effective_deposit_hashes.contains(&deposit_hash) {
            filtered_events.push(event);
        }
    }
    Ok(filtered_events)
}

#[cfg(test)]
mod tests {
    use ethers::types::Address;

    use super::*;

    #[tokio::test]
    async fn test_get_deposited_event() {
        let sender: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            .parse()
            .unwrap();
        let events = get_deposited_event(DepositQuery::BySender(sender))
            .await
            .unwrap();
        dbg!(events);
    }

    #[tokio::test]
    async fn test_get_deposit_leaf_inserted_event() {
        let events = get_deposit_leaf_inserted_event(0).await.unwrap();
        dbg!(events);
    }
}
