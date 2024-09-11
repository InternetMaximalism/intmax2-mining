use std::fs::File;

use csv::Reader;
use intmax2_zkp::{
    common::{deposit::Deposit, salt::Salt},
    ethereum_types::{bytes32::Bytes32, u256::U256},
};
use num_bigint::BigUint;

pub fn parse_withdrawals_csv() -> anyhow::Result<Vec<DepositInfo>> {
    let file = File::open("data/mainWithdrawals.csv")?;
    let mut rdr = Reader::from_reader(file);
    let mut deposit_info = Vec::new();
    for result in rdr.records() {
        let record = result?;
        let pubkey: U256 = serde_json::from_str(&add_quotation_marks(&record[0])).unwrap();
        let salt: Salt = serde_json::from_str(&add_quotation_marks(&record[1])).unwrap();
        let pubkey_salt_hash: Bytes32 =
            serde_json::from_str(&add_quotation_marks(&record[2])).unwrap();
        let leaf_index: u32 = serde_json::from_str(&record[3]).unwrap();
        let info = DepositInfo {
            pubkey,
            salt,
            deposit_index: leaf_index,
            deposit: Deposit {
                pubkey_salt_hash,
                token_index: 0,
                amount: BigUint::from(10u32).pow(18).try_into().unwrap(),
            },
        };
        deposit_info.push(info);
    }
    // sort by deposit_index
    deposit_info.sort_by(|a, b| a.deposit_index.cmp(&b.deposit_index));
    Ok(deposit_info)
}

#[derive(Debug, Clone)]
pub struct DepositInfo {
    pub pubkey: U256,
    pub salt: Salt,
    pub deposit_index: u32,
    pub deposit: Deposit,
}

fn add_quotation_marks(s: &str) -> String {
    "\"".to_string() + s + "\""
}

#[cfg(test)]
mod tests {
    use intmax2_zkp::{common::trees::deposit_tree::DepositTree, constants::DEPOSIT_TREE_HEIGHT};

    #[test]
    fn test_parse_withdrawals_csv() {
        let deposit_info = super::parse_withdrawals_csv().unwrap();

        let mut deposit_tree = DepositTree::new(DEPOSIT_TREE_HEIGHT);
        for info in &deposit_info {
            deposit_tree.push(info.deposit.clone());
        }
        let root = deposit_tree.get_root();
        dbg!(&root);
    }
}
