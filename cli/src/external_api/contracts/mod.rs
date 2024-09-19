pub mod events;
pub mod int1;
pub mod minter;
pub mod utils;

#[cfg(test)]
mod tests {
    use ethers::{
        providers::Middleware as _,
        types::{Address, TransactionRequest, U256},
    };

    use crate::{external_api::contracts::utils::get_client_with_signer, test::get_dummy_state};

    #[tokio::test]
    async fn test_innsufficient_balance() -> anyhow::Result<()> {
        let state = get_dummy_state();
        let to = "0x0000000000000000000000000000000000000000"
            .parse::<Address>()
            .unwrap();
        let tx = TransactionRequest::new()
            .to(to)
            .value(U256::from(1_000_000_000_000_000_000_000_000u128)); // 1 ETH
        let client = get_client_with_signer(state.private_data.deposit_key).await?;

        let pending_tx = client.send_transaction(tx, None).await;

        match pending_tx {
            Ok(_) => println!("Transaction sent successfully"),
            Err(e) => {
                let error_message = e.to_string();
                if error_message.contains("-32000") { // Insufficient funds code 
                    println!("Error: Insufficient funds to send the transaction");
                    println!("JSON-RPC error: {}", error_message);
                } else {
                    println!("JSON-RPC error: {}", error_message);
                }
            }
        }
        Ok(())
    }
}
