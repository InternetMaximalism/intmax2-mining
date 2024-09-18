use chrono::NaiveDateTime;

use super::prover::Prover;
use crate::{
    private_data::PrivateData,
    utils::{deposit_hash_tree::DepositHashTree, eligible_tree_with_map::EligibleTreeWithMap},
};

pub struct State {
    pub private_data: PrivateData,
    pub deposit_hash_tree: DepositHashTree,
    pub eligible_tree: EligibleTreeWithMap,
    pub last_tree_feched_at: NaiveDateTime,
    pub mode: RunMode,
    pub prover: Option<Prover>,
}

impl State {
    pub fn new(private_data: PrivateData, mode: RunMode) -> Self {
        Self {
            private_data,
            deposit_hash_tree: DepositHashTree::new(),
            eligible_tree: EligibleTreeWithMap::new(),
            last_tree_feched_at: NaiveDateTime::default(),
            mode,
            prover: None,
        }
    }

    pub fn build_circuit(&mut self) -> anyhow::Result<()> {
        self.prover = Some(Prover::new());
        Ok(())
    }

    pub async fn sync_tree(&mut self) -> anyhow::Result<()> {
        let (deposit_hash_tree, eligible_tree, last_tree_feched_at) =
            crate::services::sync::sync_trees(self.last_tree_feched_at).await?;
        self.deposit_hash_tree = deposit_hash_tree;
        self.eligible_tree = eligible_tree;
        self.last_tree_feched_at = last_tree_feched_at;
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum RunMode {
    Normal,
    Shutdown,
}
