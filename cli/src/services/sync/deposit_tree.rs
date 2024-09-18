use crate::{
    external_api::contracts::{events::get_deposit_leaf_inserted_event, int1::get_deposit_root},
    utils::deposit_hash_tree::DepositHashTree,
};
use anyhow::ensure;

pub async fn update_deposit_tree(
    deposit_hash_tree: &mut DepositHashTree,
    from_block: u64,
) -> anyhow::Result<()> {
    let events = get_deposit_leaf_inserted_event(from_block).await?;
    for event in events {
        deposit_hash_tree.push(event.deposit_hash);
    }
    let expected_root = get_deposit_root().await?;
    let actual_root = deposit_hash_tree.get_root();
    ensure!(
        expected_root == actual_root,
        "Root mismatch: expected {}, got {}",
        expected_root,
        actual_root
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_sync_deposit_tree() {
        let mut deposit_tree = DepositHashTree::new();
        update_deposit_tree(&mut deposit_tree, 0).await.unwrap();
    }
}
