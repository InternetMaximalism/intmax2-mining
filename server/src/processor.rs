use crate::{
    deposit_tree::sync::DepositSyncronizer, external_api::gnark_server::GnarkServer,
    prover::WithdrawProver,
};
use anyhow::Result;
use intmax2_zkp::{
    circuits::mining::simple_withraw_circuit::{get_pubkey_salt_hash, SimpleWithdrawPublicInputs},
    common::salt::Salt,
    ethereum_types::{address::Address, bytes32::Bytes32, u256::U256},
    utils::save::save_proof,
};
use log::{info, warn};
use rand::Rng as _;
use serde::{ser::SerializeStruct as _, Deserialize, Serialize};

pub struct Processor {
    deposit_syncronizer_main: DepositSyncronizer,
    deposit_syncronizer_sub: DepositSyncronizer,
    withdraw_prover: WithdrawProver,
    gnark_server: GnarkServer,
}

impl Processor {
    pub fn new() -> Self {
        Self {
            deposit_syncronizer_main: DepositSyncronizer::new(true),
            deposit_syncronizer_sub: DepositSyncronizer::new(false),
            withdraw_prover: WithdrawProver::new(),
            gnark_server: GnarkServer::new(),
        }
    }

    pub async fn sync_deposit_tree(&mut self, is_main: bool) -> Result<()> {
        if is_main {
            self.deposit_syncronizer_main.sync().await?;
            self.deposit_syncronizer_main
                .assert_synced()
                .await
                .expect("Deposit tree not synced");
        } else {
            self.deposit_syncronizer_sub.sync().await?;
            self.deposit_syncronizer_sub
                .assert_synced()
                .await
                .expect("Deposit tree not synced");
        }
        Ok(())
    }

    pub async fn prove_withdraw(&mut self, input: WithdrawInput) -> Result<WithdrawProof> {
        self.sync_deposit_tree(input.is_main).await?;
        let pubkey_salt_hash = get_pubkey_salt_hash(input.pubkey, input.salt);
        let deposit_tree = if input.is_main {
            &self.deposit_syncronizer_main.deposit_tree
        } else {
            &self.deposit_syncronizer_sub.deposit_tree
        };

        let deposit_leaf = deposit_tree.get_leaf(input.deposit_index as usize);
        if deposit_leaf.pubkey_salt_hash == Bytes32::default() {
            return Err(anyhow::anyhow!("Deposit not found"));
        } else if deposit_leaf.pubkey_salt_hash != pubkey_salt_hash {
            return Err(anyhow::anyhow!("Invalid pubkey or salt"));
        }
        info!(
            "Deposit found. is_main={}, depositIndex={} tokenIndex={}, amount={}",
            input.is_main, input.deposit_index, deposit_leaf.token_index, deposit_leaf.amount
        );
        let deposit_merkle_proof = deposit_tree.prove(input.deposit_index as usize);
        let deposit_root = deposit_tree.get_root();

        let mut attempts = 0;
        loop {
            let wrap_proof_with_pis = self
                .withdraw_prover
                .prove(
                    deposit_root,
                    input.deposit_index,
                    deposit_leaf.clone(),
                    deposit_merkle_proof.clone(),
                    input.recipient,
                    input.pubkey,
                    input.salt,
                )
                .map_err(|e| anyhow::anyhow!("plonky2 prover error: {:?}", e))?;
            let gnark_proof = self.gnark_server.prove(&wrap_proof_with_pis.proof).await;
            match gnark_proof {
                Ok(proof) => {
                    info!("gnark proof done");
                    return Ok(WithdrawProof {
                        proof: proof.proof,
                        public_inputs: wrap_proof_with_pis.public_inputs,
                    });
                }
                Err(e) => {
                    warn!("gnark proof failed at attempts {}: {:?}", attempts, e);
                    let mut rng = rand::thread_rng();
                    save_proof(
                        format!("failed/{}", rng.gen::<u8>()),
                        &wrap_proof_with_pis.proof,
                    )
                    .unwrap();
                    info!("Saved failed proof");
                    attempts += 1;
                    if attempts >= 2 {
                        return Err(anyhow::anyhow!("gnark proof failed"));
                    }
                }
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WithdrawInput {
    pub is_main: bool,
    pub deposit_index: u32,
    pub recipient: Address<u32>,
    pub salt: Salt,
    pub pubkey: U256<u32>,
}

#[derive(Debug, Clone)]
pub struct WithdrawProof {
    pub proof: Vec<u8>,
    pub public_inputs: SimpleWithdrawPublicInputs,
}

impl Serialize for WithdrawProof {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let proof_hex = hex::encode(&self.proof);
        let public_inputs = &self.public_inputs;
        let mut state = serializer.serialize_struct("WithdrawProof", 2)?;
        state.serialize_field("proof", &proof_hex)?;
        state.serialize_field("publicInputs", public_inputs)?;
        state.end()
    }
}

#[cfg(test)]
mod tests {
    use super::WithdrawInput;
    use intmax2_zkp::{
        common::salt::Salt,
        ethereum_types::{address::Address, u256::U256, u32limb_trait::U32LimbTrait as _},
    };

    #[test]
    fn test_withdraw_inputs() {
        let mut rng = rand::thread_rng();
        let withdaw_inputs = WithdrawInput {
            is_main: true,
            deposit_index: 0,
            recipient: Address::rand(&mut rng),
            salt: Salt::rand(&mut rng),
            pubkey: U256::rand(&mut rng),
        };
        let withdraw_str = serde_json::to_string(&withdaw_inputs).unwrap();
        println!("{}", withdraw_str);
    }
}
