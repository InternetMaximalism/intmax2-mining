use dialoguer::{Input, Select};
use ethers::{providers::Middleware as _, types::U256};
use tokio::time::sleep;

use crate::{
    config::{InitialDeposit, MiningAmount, UserSettings},
    external_api::contracts::utils::get_client,
    private_data::PrivateData,
};

pub async fn user_settings(private_data: &PrivateData) -> anyhow::Result<()> {
    if !UserSettings::new().is_err() {
        // user settings already exists
        return Ok(());
    }
    let rpc_url: String = Input::new().with_prompt("RPC URL").interact()?;

    let mining_amount = {
        let items = vec!["0.1 ETH", "1.0 ETH"];
        let selection = Select::new()
            .with_prompt("Choose mining amount")
            .items(&items)
            .default(0)
            .interact()?;
        match selection {
            0 => MiningAmount::OneTenth,
            1 => MiningAmount::One,
            _ => unreachable!(),
        }
    };

    let initial_deposit = {
        let items = vec!["1 ETH", "10 ETH", "100 ETH"];
        let selection = Select::new()
            .with_prompt("Choose initial deposit")
            .items(&items)
            .default(0)
            .interact()?;
        match selection {
            0 => InitialDeposit::One,
            1 => InitialDeposit::Ten,
            2 => InitialDeposit::Hundred,
            _ => unreachable!(),
        }
    };

    let remaining_deposits = {
        let mining_amount = match mining_amount {
            MiningAmount::OneTenth => 0.1,
            MiningAmount::One => 1.0,
        };
        let initial_deposit = match initial_deposit {
            InitialDeposit::One => 1,
            InitialDeposit::Ten => 10,
            InitialDeposit::Hundred => 100,
        };
        (initial_deposit as f64 / mining_amount) as u64
    };

    UserSettings {
        rpc_url,
        mining_amount,
        initial_deposit,
        remaining_deposits,
    }
    .save()?;

    initial_balance(private_data, initial_deposit).await?;

    Ok(())
}

async fn initial_balance(
    private_data: &PrivateData,
    initial_deposit: InitialDeposit,
) -> anyhow::Result<()> {
    let client = get_client().await?;
    let addresses = private_data.to_addresses().await?;
    let deposit_balance = client.get_balance(addresses.deposit_address, None).await?;

    let initial_deposit = match initial_deposit {
        InitialDeposit::One => ethers::utils::parse_ether("1").unwrap(),
        InitialDeposit::Ten => ethers::utils::parse_ether("10").unwrap(),
        InitialDeposit::Hundred => ethers::utils::parse_ether("100").unwrap(),
    };

    let mining_gas = ethers::utils::parse_ether("0.1").unwrap();
    let mining_gas_formatted = pretty_format_u256(mining_gas);

    if deposit_balance < initial_deposit {
        let deposit_balance_formatted = pretty_format_u256(deposit_balance);
        let initial_deposit_formatted = pretty_format_u256(initial_deposit);
        println!(
            "Deposit Address: {:?}  Balance: {} ETH",
            addresses.deposit_address, deposit_balance_formatted
        );
        println!(
            "Please deposit at least {} ETH + gas {} ETH to the above address",
            initial_deposit_formatted, mining_gas_formatted
        );
        loop {
            let deposit_balance = client.get_balance(addresses.deposit_address, None).await?;
            if deposit_balance >= initial_deposit + mining_gas {
                println!("Deposit completed!");
                break;
            }
            sleep(std::time::Duration::from_secs(5)).await;
        }
    }

    let claim_balance = client.get_balance(addresses.claim_address, None).await?;
    if claim_balance < mining_gas {
        let claim_balance_formatted = pretty_format_u256(claim_balance);
        println!(
            "Claim Address: {:?} Balance: {} ETH",
            addresses.claim_address, claim_balance_formatted
        );
        println!(
            "Please deposit at least {} ETH as gas to the above address",
            mining_gas_formatted
        );
        loop {
            let claim_balance = client.get_balance(addresses.claim_address, None).await?;
            if claim_balance >= mining_gas {
                println!("Deposit completed");
                break;
            }
            sleep(std::time::Duration::from_secs(5)).await;
        }
    }
    Ok(())
}

fn pretty_format_u256(value: U256) -> String {
    let s = ethers::utils::format_units(value, "ether").unwrap();
    // remove trailing zeros
    let s = s.trim_end_matches('0').trim_end_matches('.');
    s.to_string()
}

#[cfg(test)]
mod tests {

    #[test]
    fn test_pretty_format() {
        let value = ethers::utils::parse_ether("1.01000000000000000").unwrap();
        let pretty = super::pretty_format_u256(value);
        assert_eq!(pretty, "1.01");

        let value = ethers::utils::parse_ether("1.00000000000000000").unwrap();
        let pretty = super::pretty_format_u256(value);
        assert_eq!(pretty, "1");
    }
}
