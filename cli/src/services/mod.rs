use claim::{
    claim_task::claim_task,
    determin::{determin_next_claim_process, ClaimProcess},
};
use mining::{
    cancel::cancel_task,
    deposit::deposit_task,
    determin::{determin_next_mining_process, MiningProcess},
    withdrawal::withdrawal_task,
};

use crate::{cli::status::print_status, config::Settings, state::state::State};

pub mod claim;
pub mod mining;
pub mod sync;

pub async fn main_loop(state: &mut State) -> anyhow::Result<()> {
    let mut is_mining_ended = false;

    loop {
        state.sync_tree().await?;
        if is_mining_ended {
            break;
        }
        let next_process = determin_next_mining_process(state).await?;
        match next_process {
            MiningProcess::Deposit => {
                print_status("Deposit");
                deposit_task(state).await?;
                mining_cooldown().await?;
            }
            MiningProcess::Withdrawal(event) => {
                print_status("Withdrawal");
                withdrawal_task(state, event).await?;
                mining_cooldown().await?;
            }
            MiningProcess::Cancel(event) => {
                print_status("Cancel");
                cancel_task(state, event).await?
            }
            MiningProcess::WaitingForAnalyze => {
                print_status("WaitingForAnalyze");
            }
            MiningProcess::End => {
                print_status("MiningEnd");
                is_mining_ended = true;
            }
        }
        let next_process = determin_next_claim_process(state).await?;
        match next_process {
            ClaimProcess::Claim(events) => {
                print_status(&format!("Claim {}", events.len()));
                claim_task(state, &events).await?;
                claim_cooldown().await?;
            }
            ClaimProcess::Wait => (),
            ClaimProcess::End => break,
        }
    }
    Ok(())
}

async fn mining_cooldown() -> anyhow::Result<()> {
    print_status("Mining cooldown...");
    let settings = Settings::new()?;
    tokio::time::sleep(std::time::Duration::from_secs(
        settings.service.mining_cooldown_in_sec,
    ))
    .await;
    Ok(())
}

async fn claim_cooldown() -> anyhow::Result<()> {
    print_status("Claim cooldown...");
    let settings = Settings::new()?;
    tokio::time::sleep(std::time::Duration::from_secs(
        settings.service.claim_cooldown_in_sec,
    ))
    .await;
    Ok(())
}
