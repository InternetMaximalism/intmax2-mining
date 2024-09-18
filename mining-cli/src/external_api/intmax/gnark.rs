use std::time::{SystemTime, UNIX_EPOCH};

use ethers::types::Address;
use intmax2_zkp::wrapper_config::plonky2_config::PoseidonBN128GoldilocksConfig;

use plonky2::{
    field::goldilocks_field::GoldilocksField,
    plonk::proof::{Proof, ProofWithPublicInputs},
};
use serde::{Deserialize, Serialize};

use crate::config::Settings;

type F = GoldilocksField;
type C = PoseidonBN128GoldilocksConfig;
const D: usize = 2;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct GnarkStartProofInput {
    pub address: Address,
    pub proof: Proof<F, C, D>,
    pub public_inputs: Vec<F>,
}

impl GnarkStartProofInput {
    pub fn new(address: Address, proof: ProofWithPublicInputs<F, C, D>) -> Self {
        Self {
            address,
            proof: proof.proof,
            public_inputs: proof.public_inputs,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GnarkStartProofOutput {
    pub job_id: String,
    pub status: String,
    pub estimated_time: Option<u64>, // in milliseconds
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GnarkGetProofOutput {
    pub job_id: String,
    pub status: String,
    pub result: Option<GnarkProof>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GnarkProof {
    pub public_inputs: Option<Vec<String>>,
    pub proof: String,
}

pub async fn gnark_start_prove(
    base_url: &str,
    address: Address,
    plonky2_proof: ProofWithPublicInputs<F, C, D>,
) -> anyhow::Result<GnarkStartProofOutput> {
    let input = GnarkStartProofInput::new(address, plonky2_proof);

    let response = reqwest::Client::new()
        .post(format!("{}/start-proof", base_url))
        .json(&input)
        .send()
        .await?;
    let output: GnarkStartProofOutput = response.json().await.unwrap();
    Ok(output)
}

pub async fn gnark_get_proof(base_url: &str, job_id: &str) -> anyhow::Result<GnarkGetProofOutput> {
    let response = reqwest::Client::new()
        .get(format!("{}/get-proof?jobId={}", base_url, job_id))
        .send()
        .await?;
    let output: GnarkGetProofOutput = response.json().await?;
    Ok(output)
}

pub async fn fetch_gnark_proof(
    base_url: &str,
    job_id: &str,
    start_query_time: u64,
) -> anyhow::Result<GnarkProof> {
    let cooldown = Settings::new()?.api.gnark_get_proof_cooldown_in_sec;
    sleep_until(start_query_time).await;

    // TODO: better error handling and retry logic
    loop {
        let output = gnark_get_proof(base_url, job_id).await?;
        if output.status == "done" {
            return Ok(output.result.unwrap());
        } else if output.status == "error" {
            anyhow::bail!("Gnark prover error: {:?}", output);
        }
        tokio::time::sleep(tokio::time::Duration::from_secs(cooldown)).await;
    }
}

async fn sleep_until(target_time: u64) {
    loop {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        if now >= target_time {
            break;
        }
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    }
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn test_gnark_start_prove() {}
}
