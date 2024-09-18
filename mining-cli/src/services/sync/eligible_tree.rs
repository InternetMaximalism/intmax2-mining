use intmax2_zkp::ethereum_types::u256::U256;
use mining_circuit::eligible_tree::EligibleLeaf;
use num_bigint::BigUint;

use crate::utils::eligible_tree_with_map::EligibleTreeWithMap;

pub async fn sync_eligible_tree() -> anyhow::Result<EligibleTreeWithMap> {
    // TODO: fetch the checkpoint from github
    // For now, we use a dummy tree
    let mut eligible_tree = EligibleTreeWithMap::new();
    for i in 0..100 {
        eligible_tree.push(EligibleLeaf {
            deposit_index: i,
            amount: U256::try_from(BigUint::from(10u32).pow(18)).unwrap(),
        });
    }
    Ok(eligible_tree)
}
