use crate::{
    external_api::contracts::{events::get_effective_deposits, int1::get_deposit_root},
    utils::deposit_hash_tree::DepositHashTree,
};
use anyhow::ensure;
use intmax2_zkp::utils::leafable::Leafable as _;

pub async fn sync_deposit_tree() -> anyhow::Result<DepositHashTree> {
    let mut deposit_hash_tree = DepositHashTree::new();

    // TODO: fetch the checkpoint from github
    // For now, we fetch all the events from the contract but in the future we will only fetch the new events
    let events = get_effective_deposits(0).await?;
    for event in events {
        deposit_hash_tree.push(event.deposit().hash());
    }
    let expected_root = get_deposit_root().await?;
    let actual_root = deposit_hash_tree.get_root();
    ensure!(
        expected_root == actual_root,
        "Root mismatch: expected {}, got {}",
        expected_root,
        actual_root
    );

    Ok(deposit_hash_tree)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_sync_deposit_tree() {
        let _deposit_tree = sync_deposit_tree().await.unwrap();
    }
}
