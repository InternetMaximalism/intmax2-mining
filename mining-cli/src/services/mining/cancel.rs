use ethers::providers::{Http, PendingTransaction};
use intmax2_zkp::ethereum_types::u32limb_trait::U32LimbTrait as _;

use crate::{
    external_api::contracts::{
        events::Deposited,
        int1::{get_int1_contract_with_signer, int_1},
    },
    state::state::State,
};

pub async fn cancel_task(state: &State, event: Deposited) -> anyhow::Result<()> {
    let int1 = get_int1_contract_with_signer(state.private_data.deposit_key).await?;

    let deposit = int_1::Deposit {
        recipient_salt_hash: event.recipient_salt_hash.to_bytes_be().try_into().unwrap(),
        token_index: event.token_index,
        amount: ethers::types::U256::from_big_endian(&event.amount.to_bytes_be()),
    };
    let tx = int1.cancel_deposit(event.deposit_id.into(), deposit);
    let pending_tx: PendingTransaction<Http> = match tx.send().await {
        Ok(tx) => tx,
        Err(e) => {
            // TODO: better error handling
            return Err(anyhow::anyhow!("Error sending transaction: {:?}", e));
        }
    };
    println!("cancel tx hash: {:?}", pending_tx.tx_hash());
    let _tx_receipt = pending_tx.await?;
    Ok(())
}
