use ethers::{
    providers::{Http, PendingTransaction},
    types::U256,
};
use intmax2_zkp::{
    common::deposit::get_pubkey_salt_hash, ethereum_types::u32limb_trait::U32LimbTrait as _,
};

use crate::{
    cli::status::print_status,
    config::{MiningAmount, UserSettings},
    external_api::contracts::{int1::get_int1_contract_with_signer, utils::get_account_nonce},
    state::state::State,
    utils::salt::{get_pubkey_from_private_key, get_salt_from_private_key_nonce},
};

pub async fn deposit_task(state: &State) -> anyhow::Result<()> {
    let deposit_address = state.private_data.to_addresses().await?.deposit_address;
    let nonce = get_account_nonce(deposit_address).await?;
    let salt = get_salt_from_private_key_nonce(state.private_data.deposit_key, nonce);
    let pubkey = get_pubkey_from_private_key(state.private_data.deposit_key);
    let pubkey_salt_hash: [u8; 32] = get_pubkey_salt_hash(pubkey, salt)
        .to_bytes_be()
        .try_into()
        .unwrap();

    let mining_amount: U256 = match UserSettings::new()?.mining_amount {
        MiningAmount::OneTenth => ethers::utils::parse_units("0.1", "ether").unwrap().into(),
        MiningAmount::One => ethers::utils::parse_units("1", "ether").unwrap().into(),
    };

    let int1 = get_int1_contract_with_signer(state.private_data.deposit_key).await?;

    // TODO: specify the nonce
    let tx = int1
        .deposit_native_token(pubkey_salt_hash)
        .value(mining_amount);
    let pending_tx: PendingTransaction<Http> = match tx.send().await {
        Ok(tx) => tx,
        Err(e) => {
            // TODO: better error handling
            return Err(anyhow::anyhow!("Error sending transaction: {:?}", e));
        }
    };
    print_status(&format!("deposit tx hash: {:?}", pending_tx.tx_hash()));
    let _tx_receipt = pending_tx.await?;

    // reduce remaining deposits
    let mut user_settings = UserSettings::new()?;
    user_settings.remaining_deposits -= 1;
    user_settings.save()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::test::get_dummy_state;

    #[tokio::test]
    async fn test_deposit() {
        let state = get_dummy_state();
        super::deposit_task(&state).await.unwrap();
    }
}
