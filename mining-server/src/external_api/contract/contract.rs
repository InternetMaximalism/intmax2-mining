use anyhow::Result;
use ethers::{
    contract::abigen,
    providers::{Http, Provider},
    types::Address,
};

use super::utils::get_client;

abigen!(Int0, "../contracts/artifacts/contracts/Int0.sol/Int0.json",);

pub async fn get_int0_contract(is_main: bool) -> Result<int_0::Int0<Provider<Http>>> {
    let client = get_client().await?;
    let address: Address = if is_main {
        crate::env::load_env().int0_main_contract_address.parse()?
    } else {
        crate::env::load_env().int0_sub_contract_address.parse()?
    };
    let contract = Int0::new(address, client);
    Ok(contract)
}
