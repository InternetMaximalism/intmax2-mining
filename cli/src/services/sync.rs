use crate::{
    external_api::contracts::{events::get_deposit_leaf_inserted_event, int1::get_deposit_root},
    external_api::github::fetch_latest_tree_from_github,
    utils::deposit_hash_tree::DepositHashTree,
    utils::{
        bin_parser::{DepositTreeInfo, EligibleTreeInfo},
        eligible_tree_with_map::EligibleTreeWithMap,
    },
};
use anyhow::ensure;
use chrono::NaiveDateTime;

pub async fn sync_trees(
    last_update: NaiveDateTime,
) -> anyhow::Result<(DepositHashTree, EligibleTreeWithMap, NaiveDateTime)> {
    let (mut deposit_hash_tree, eligible_tree, from_block, last_update) =
        fetch_or_create_trees(last_update).await?;

    update_deposit_tree(&mut deposit_hash_tree, from_block).await?;

    Ok((deposit_hash_tree, eligible_tree, last_update))
}

async fn fetch_or_create_trees(
    last_update: NaiveDateTime,
) -> anyhow::Result<(DepositHashTree, EligibleTreeWithMap, u64, NaiveDateTime)> {
    match fetch_latest_tree_from_github(last_update).await? {
        Some((bin_deposit_tree, bin_eligible_tree, last_update)) => {
            let deposit_tree_info: DepositTreeInfo = bin_deposit_tree.try_into()?;
            let eligible_tree_info: EligibleTreeInfo = bin_eligible_tree.try_into()?;
            Ok((
                deposit_tree_info.tree,
                eligible_tree_info.tree,
                deposit_tree_info.block_number,
                last_update,
            ))
        }
        None => Ok((
            DepositHashTree::new(),
            EligibleTreeWithMap::new(),
            0,
            NaiveDateTime::default(),
        )),
    }
}

async fn update_deposit_tree(
    deposit_hash_tree: &mut DepositHashTree,
    from_block: u64,
) -> anyhow::Result<()> {
    let events = get_deposit_leaf_inserted_event(from_block).await?;
    for event in events {
        if deposit_hash_tree.tree.len() == event.deposit_index as usize {
            deposit_hash_tree.push(event.deposit_hash);
        }
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
