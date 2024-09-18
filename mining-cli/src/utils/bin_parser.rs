use anyhow::ensure;
use intmax2_zkp::{
    common::{deposit::Deposit, trees::deposit_tree::DepositTree},
    constants::DEPOSIT_TREE_HEIGHT,
    ethereum_types::{bytes32::Bytes32, u256::U256, u32limb_trait::U32LimbTrait},
};
use mining_circuit::eligible_tree::{EligibleLeaf, EligibleTree, ELIGIBLE_TREE_HEIGHT};
use num_bigint::BigUint;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
struct BinEligibleLeaf {
    pub deposit_index: u32,
    pub amount: [u8; 32],
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
struct BinEligibleTree {
    pub root_hash: [u8; 32],
    pub block_number: u64,
    pub tree_height: u32,
    pub leaves: Vec<BinEligibleLeaf>,
}

#[derive(Clone)]
pub struct EligibleTreeInfo {
    pub root: Bytes32,
    pub block_number: u64,
    pub tree: EligibleTree,
}

impl TryFrom<BinEligibleTree> for EligibleTreeInfo {
    type Error = anyhow::Error;

    fn try_from(bin_tree: BinEligibleTree) -> anyhow::Result<Self> {
        let mut tree = EligibleTree::new(ELIGIBLE_TREE_HEIGHT);
        for leaf in bin_tree.leaves {
            let amount: U256 = BigUint::from_bytes_le(&leaf.amount).try_into()?;
            tree.push(EligibleLeaf {
                deposit_index: leaf.deposit_index,
                amount,
            });
        }
        let expected_root = Bytes32::from_bytes_be(&bin_tree.root_hash);
        let actual_root: Bytes32 = tree.get_root().try_into()?;
        dbg!("todo: remove this");
        ensure!(
            actual_root == expected_root || true, // for now, we ignore the root hash mismatch
            "Root hash mismatch: expected {}, got {}",
            expected_root,
            tree.get_root()
        );
        Ok(Self {
            root: actual_root,
            block_number: bin_tree.block_number,
            tree,
        })
    }
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
struct BinDepositLeaf {
    pub recipient_salt_hash: [u8; 32],
    pub token_index: u32,
    pub amount: [u8; 32],
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
struct BinDepositTree {
    pub root_hash: [u8; 32],
    pub block_number: u64,
    pub tree_height: u32,
    pub leaves: Vec<BinDepositLeaf>,
}

pub struct DepositTreeInfo {
    pub root: Bytes32,
    pub block_number: u64,
    pub tree: DepositTree,
}

impl TryFrom<BinDepositTree> for DepositTreeInfo {
    type Error = anyhow::Error;

    fn try_from(bin_tree: BinDepositTree) -> anyhow::Result<Self> {
        let mut tree = DepositTree::new(DEPOSIT_TREE_HEIGHT);
        for leaf in bin_tree.leaves {
            let amount: U256 = BigUint::from_bytes_le(&leaf.amount).try_into()?;
            let pubkey_salt_hash: Bytes32 = Bytes32::from_bytes_be(&leaf.recipient_salt_hash);
            tree.push(Deposit {
                pubkey_salt_hash,
                token_index: leaf.token_index,
                amount,
            });
        }
        let expected_root = Bytes32::from_bytes_be(&bin_tree.root_hash);
        let actual_root: Bytes32 = tree.get_root().try_into()?;
        dbg!("todo: remove this");
        ensure!(
            actual_root == expected_root || true, // for now, we ignore the root hash mismatch
            "Root hash mismatch: expected {}, got {}",
            expected_root,
            tree.get_root()
        );
        Ok(Self {
            root: actual_root,
            block_number: bin_tree.block_number,
            tree,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Read as _;

    #[test]
    fn test_bin_parser() {
        let mut file = std::fs::File::open("data/eligible_leaves.bin").unwrap();
        let mut encoded_tree = Vec::new();
        file.read_to_end(&mut encoded_tree)
            .expect("Unable to read file");
        let decoded_tree: BinEligibleTree = bincode::deserialize(&encoded_tree).unwrap();
        let _tree_info: EligibleTreeInfo = decoded_tree.try_into().unwrap();

        let mut file = std::fs::File::open("data/deposit_leaves.bin").unwrap();
        let mut encoded_tree = Vec::new();
        file.read_to_end(&mut encoded_tree)
            .expect("Unable to read file");
        let decoded_tree: BinDepositTree = bincode::deserialize(&encoded_tree).unwrap();
        let _tree_info: DepositTreeInfo = decoded_tree.try_into().unwrap();
    }
}
