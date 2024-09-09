use crate::{app::config, processor::Processor};
use anyhow::Context;
use mining_circuit::claim::claim_inner_circuit::ClaimInnerValue;
use redis::{ExistenceCheck, SetExpiry, SetOptions};

pub async fn generate_claim_proof_job(
    request_id: String,
    values: &[ClaimInnerValue],
    processor: &Processor,
    conn: &mut redis::aio::Connection,
) -> anyhow::Result<()> {
    log::debug!("Proving...");
    let claim_output = processor
        .process_prove(values)
        .await
        .with_context(|| "Failed to prove")?;
    let claim_output_str = serde_json::to_string(&claim_output).expect("Failed to serialize proof");
    let opts = SetOptions::default()
        .conditional_set(ExistenceCheck::NX)
        .get(true)
        .with_expiration(SetExpiry::EX(config::get("proof_expiration")));
    let _ = redis::Cmd::set_options(&request_id, claim_output_str.clone(), opts)
        .query_async::<_, Option<String>>(conn)
        .await
        .with_context(|| "Failed to set proof")?;
    Ok(())
}
