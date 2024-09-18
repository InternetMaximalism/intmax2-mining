use chrono::NaiveDateTime;

use super::prover::Prover;
use crate::{
    private_data::PrivateData,
    services::sync::{deposit_tree::update_deposit_tree, eligible_tree::sync_eligible_tree},
    utils::{deposit_hash_tree::DepositHashTree, eligible_tree_with_map::EligibleTreeWithMap},
};

pub struct State {
    pub private_data: PrivateData,
    pub deposit_hash_tree: DepositHashTree,
    pub eligible_tree: EligibleTreeWithMap,
    pub last_tree_feched_at: Option<NaiveDateTime>,
    pub mode: RunMode,
    pub prover: Option<Prover>,
}

impl State {
    pub fn new(private_data: PrivateData, mode: RunMode) -> Self {
        Self {
            private_data,
            deposit_hash_tree: DepositHashTree::new(),
            eligible_tree: EligibleTreeWithMap::new(),
            last_tree_feched_at: None,
            mode,
            prover: None,
        }
    }

    pub fn build_circuit(&mut self) -> anyhow::Result<()> {
        self.prover = Some(Prover::new());
        Ok(())
    }

    pub async fn sync_tree(&mut self) -> anyhow::Result<()> {
        self.eligible_tree = sync_eligible_tree().await?;
        update_deposit_tree(&mut self.deposit_hash_tree, 0).await?;
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum RunMode {
    Normal,
    Shutdown,
}
