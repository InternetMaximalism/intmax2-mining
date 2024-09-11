use crate::{
    env::load_env,
    external_api::contract::{
        contract::get_int0_contract, convert::DepositEventIntmax, event::get_deposit_events,
        utils::get_client,
    },
};
use anyhow::{ensure, Result};
use ethers::types::Address;
use intmax2_zkp::{
    common::{deposit::Deposit, trees::deposit_tree::DepositTree},
    constants::DEPOSIT_TREE_HEIGHT,
    ethereum_types::u32limb_trait::U32LimbTrait as _,
};
use log::info;

pub struct DepositSyncronizer {
    pub is_main: bool,
    pub deposit_tree: DepositTree,
    pub leaf_index: u32,   // leaf index of next deposit
    pub block_number: u64, // block number of last deposit
}

impl DepositSyncronizer {
    pub fn new(is_main: bool) -> Self {
        Self {
            is_main,
            deposit_tree: DepositTree::new(DEPOSIT_TREE_HEIGHT),
            leaf_index: 0,
            block_number: load_env().int0_deployed_block_number,
        }
    }

    pub async fn sync(&mut self) -> Result<()> {
        let contract = get_int0_contract(self.is_main).await?;
        let contract_leaf_index: u32 = contract.leaf_index().call().await?;
        if contract_leaf_index < self.leaf_index {
            // this never happens
            panic!("Contract leaf index is less than local leaf index");
        } else if contract_leaf_index == self.leaf_index {
            // up to date
            info!("Deposit tree is up to date");
            return Ok(());
        }
        info!(
            "Syncing deposit tree from leaf index {} to {}",
            self.leaf_index, contract_leaf_index
        );
        // sync deposit events
        let contract_address: Address = if self.is_main {
            load_env().int0_main_contract_address.parse()?
        } else {
            load_env().int0_sub_contract_address.parse()?
        };
        let client = get_client().await?;
        let events = get_deposit_events(&client, contract_address, self.block_number + 1).await?;
        if events.is_empty() {
            // this never happens
            panic!("No deposit events found");
        }
        for event in events {
            assert_eq!(self.leaf_index, event.leaf_index, "Leaf index mismatch");
            let event: DepositEventIntmax = event.into();
            self.deposit_tree.push(Deposit {
                pubkey_salt_hash: event.pubkey_salt_hash,
                token_index: event.token_index,
                amount: event.amount,
            });
            self.leaf_index += 1;
            self.block_number = event.block_number;
        }
        info!("Synced");
        Ok(())
    }

    pub async fn assert_synced(&self) -> Result<()> {
        let contract = get_int0_contract(self.is_main).await?;
        let contract_leaf_index: u32 = contract.leaf_index().call().await?;
        let latest_root: [u8; 32] = contract.get_deposit_root().call().await?;
        ensure!(
            self.leaf_index == contract_leaf_index,
            "Leaf index mismatch"
        );
        ensure!(
            self.deposit_tree.get_root().to_bytes_be() == latest_root.to_vec(),
            "Root mismatch"
        );
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use core::time;

    use tokio::time::sleep;

    use crate::log::init_logger;

    #[tokio::test]
    async fn test_sync() {
        init_logger();
        let mut sync = super::DepositSyncronizer::new(true);
        loop {
            sync.sync().await.unwrap();
            sync.assert_synced().await.unwrap();
            sleep(time::Duration::from_secs(10)).await;
        }
    }
}
