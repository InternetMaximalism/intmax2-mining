use intmax2_zkp::{
    common::trees::deposit_tree::{DepositLeaf, DepositTree},
    constants::DEPOSIT_TREE_HEIGHT,
    ethereum_types::bytes32::Bytes32,
};

pub mod sync;

use crate::external_api::contract::convert::DepositEventIntmax;

pub fn get_deposit_root_from_all_events(events: &[DepositEventIntmax]) -> Bytes32<u32> {
    let mut tree = DepositTree::new(DEPOSIT_TREE_HEIGHT);
    for (i, event) in events.iter().enumerate() {
        assert_eq!(i as u32, event.leaf_index);
        tree.push(DepositLeaf {
            pubkey_salt_hash: event.pubkey_salt_hash,
            token_index: event.token_index,
            amount: event.amount,
        });
    }
    tree.get_root()
}

#[cfg(test)]
mod tests {
    use crate::{
        env::load_env,
        external_api::contract::{
            contract::{get_int0_contract, DepositLeaf as ContractDepositLeaf},
            convert::{from_intmax_u256_to_ether_u256, DepositEventIntmax},
            event::get_deposit_events,
            utils::get_client,
        },
    };
    use anyhow::{ensure, Result};
    use ethers::types::Address;
    use intmax2_zkp::{
        common::trees::deposit_tree::DepositLeaf, ethereum_types::u32limb_trait::U32LimbTrait,
        utils::leafable::Leafable,
    };

    #[tokio::test]
    async fn deposit_root_equality() -> Result<()> {
        let client = get_client().await?;
        let contract_address: Address = load_env().int0_main_contract_address.parse()?;
        let events = get_deposit_events(&client, contract_address, 0).await?;
        ensure!(events.len() > 0, "No deposit events found");
        let events_intmax: Vec<DepositEventIntmax> = events.into_iter().map(Into::into).collect();
        let root = super::get_deposit_root_from_all_events(&events_intmax);
        // get root from contract
        let contract = get_int0_contract(true).await?;
        let root_from_contract: [u8; 32] = contract.get_deposit_root().call().await?;
        ensure!(root.to_bytes_be() == root_from_contract.to_vec());
        Ok(())
    }

    #[tokio::test]
    async fn leaf_hash_equality() -> Result<()> {
        let rng = &mut rand::thread_rng();
        let leaf = DepositLeaf::rand(rng);
        let leaf_hash_intmax = leaf.hash();

        let contract = get_int0_contract(true).await?;
        let leaf_hash_contract: [u8; 32] = contract
            .get_leaf_hash(ContractDepositLeaf {
                pubkey_salt_hash: leaf.pubkey_salt_hash.to_bytes_be().try_into().unwrap(),
                token_index: leaf.token_index,
                amount: from_intmax_u256_to_ether_u256(leaf.amount),
            })
            .call()
            .await?;
        ensure!(leaf_hash_intmax.to_bytes_be() == leaf_hash_contract.to_vec());
        Ok(())
    }
}
