use std::{collections::HashMap, str::FromStr};

use crate::env::load_env;
use anyhow::Result;
use core::fmt::{Debug, Display};
use intmax2_zkp::wrapper_config::plonky2_config::PoseidonBN128GoldilocksConfig;
use log::{info, warn};
use num_bigint::BigUint;
use plonky2::{field::goldilocks_field::GoldilocksField, plonk::proof::ProofWithPublicInputs};

type F = GoldilocksField;
const D: usize = 2;
type C = PoseidonBN128GoldilocksConfig;

pub struct GnarkServer {
    job_ids: HashMap<Vec<F>, String>,
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartProofResponse {
    job_id: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetProofResponse {
    status: String,
    result: GnarkProofString,
}

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GnarkProofString {
    pub public_inputs: Option<Vec<String>>,
    pub proof: String,
}

#[derive(Clone)]
pub struct GnarkProof {
    pub public_inputs: Vec<BigUint>,
    pub proof: Vec<u8>,
}

impl Display for GnarkProof {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let proof = hex::encode(&self.proof);
        write!(
            f,
            "GnarkProof {{ public_inputs: {:?}, proof: {:?} }}",
            self.public_inputs, proof
        )
    }
}

impl Debug for GnarkProof {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        <Self as Display>::fmt(&self, f)
    }
}

impl GnarkServer {
    pub fn new() -> Self {
        Self {
            job_ids: HashMap::new(),
        }
    }

    pub async fn health_check(&self) -> Result<()> {
        let gnark_server_base_url = load_env().gnark_server_url;
        let health_check_url = format!("{}/health", gnark_server_base_url);
        let client = reqwest::Client::new();
        let res = client.get(health_check_url).send().await?;
        if res.status().is_success() {
            info!("Gnark server is healthy");
            return Ok(());
        } else {
            warn!("Gnark server is not healthy");
            return Err(anyhow::anyhow!("Gnark server is not healthy"));
        }
    }

    async fn start_proof(&mut self, proof: &ProofWithPublicInputs<F, C, D>) -> Result<()> {
        info!("Starting proof");
        if self.job_ids.contains_key(&proof.public_inputs) {
            warn!("Proof already started");
            return Ok(());
        }
        let gnark_server_base_url = load_env().gnark_server_url;
        let start_proof_url = format!("{}/start-proof", gnark_server_base_url);
        let client = reqwest::Client::new();
        let res = client.post(start_proof_url).json(&proof).send().await?;
        let parsed_res: StartProofResponse = res.json::<StartProofResponse>().await?;
        let job_id = parsed_res.job_id;
        self.job_ids.insert(proof.public_inputs.clone(), job_id);
        info!("pis: {:?}", proof.public_inputs);
        info!(
            "Proof started, job_id: {}",
            self.job_ids.get(&proof.public_inputs).unwrap()
        );
        Ok(())
    }

    async fn get_proof(&mut self, public_inputs: &[F]) -> Result<Option<GnarkProof>> {
        if self.job_ids.get(public_inputs).is_none() {
            warn!("Proof not started");
            return Err(anyhow::anyhow!("Proof not started"));
        }
        let gnark_server_base_url = load_env().gnark_server_url;
        let job_id = self.job_ids.get(public_inputs).unwrap();
        let get_proof_result_url = format!("{}/get-proof?jobId={}", gnark_server_base_url, job_id);
        let client = reqwest::Client::new();
        let res = client.get(get_proof_result_url).send().await?;
        let parsed_res = res.json::<GetProofResponse>().await?;

        if parsed_res.status == "in progress" {
            info!("Proof in progress...");
            return Ok(None);
        } else if parsed_res.status == "done" {
            let proof = hex::decode(parsed_res.result.proof)?;
            let public_inputs = parsed_res
                .result
                .public_inputs
                .as_ref()
                .unwrap()
                .iter()
                .map(|x| BigUint::from_str(x).unwrap())
                .collect();
            let result = GnarkProof {
                public_inputs,
                proof,
            };
            return Ok(Some(result));
        } else {
            self.job_ids.remove(public_inputs); // clear public inputs
            return Err(anyhow::anyhow!("Proof failed"));
        }
    }

    pub async fn prove(&mut self, proof: &ProofWithPublicInputs<F, C, D>) -> Result<GnarkProof> {
        self.start_proof(proof).await?;

        tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
        loop {
            match self.get_proof(&proof.public_inputs).await? {
                Some(proof) => return Ok(proof),
                None => tokio::time::sleep(tokio::time::Duration::from_secs(10)).await,
            };
        }
    }
}

#[cfg(test)]
mod tests {
    use intmax2_zkp::{
        common::{
            deposit::{get_pubkey_salt_hash, Deposit},
            salt::Salt,
            trees::deposit_tree::DepositTree,
        },
        constants::DEPOSIT_TREE_HEIGHT,
        ethereum_types::{address::Address, u256::U256, u32limb_trait::U32LimbTrait as _},
    };
    use rand::Rng;

    use super::*;
    use crate::{
        external_api::contract::contract::get_int0_contract, log::init_logger,
        prover::WithdrawProver,
    };

    #[tokio::test]
    async fn test_gnark_server() {
        init_logger();

        let prover = WithdrawProver::new();

        let mut rng = rand::thread_rng();
        let mut deposit_tree = DepositTree::new(DEPOSIT_TREE_HEIGHT);

        // add dummy deposits
        for _ in 0..100 {
            let deposit_leaf = Deposit::rand(&mut rng);
            deposit_tree.push(deposit_leaf);
        }

        let salt = Salt::rand(&mut rng);
        let pubkey = U256::rand(&mut rng);
        let pubkey_salt_hash = get_pubkey_salt_hash(pubkey, salt);
        let deposit = Deposit {
            pubkey_salt_hash,
            token_index: rng.gen(),
            amount: U256::rand(&mut rng),
        };
        let deposit_index = deposit_tree.len();
        deposit_tree.push(deposit.clone());

        // add dummy deposits
        for _ in 0..100 {
            let deposit_leaf = Deposit::rand(&mut rng);
            deposit_tree.push(deposit_leaf);
        }

        let deposit_merkle_proof = deposit_tree.prove(deposit_index);

        let recipient = Address::rand(&mut rng);
        let wrap_proof_with_pis = prover
            .prove(
                deposit_tree.get_root(),
                deposit_index as u32,
                deposit.clone(),
                deposit_merkle_proof.clone(),
                recipient,
                pubkey,
                salt,
            )
            .expect("Failed to prove");

        let mut gnark_server = GnarkServer::new();

        let gnark_proof = gnark_server
            .prove(&wrap_proof_with_pis.proof)
            .await
            .expect("Failed to prove");
        info!("Gnark proof: {:?}", gnark_proof);

        // verify proof on contract
        let contract = get_int0_contract(true).await.unwrap();
        let verified = contract
            .verify_proof(
                wrap_proof_with_pis.public_inputs.into(),
                gnark_proof.proof.into(),
            )
            .call()
            .await
            .unwrap();
        info!("Proof verified: {}", verified);
    }
}
