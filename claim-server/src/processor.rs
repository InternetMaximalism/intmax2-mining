use anyhow::{ensure, Result};
use intmax2_zkp::ethereum_types::bytes32::Bytes32;
use mining_circuit::claim::{
    claim_circuit::ClaimPublicInputs, claim_inner_circuit::ClaimInnerValue,
    claim_processor::ClaimProcessor, claim_wrapper_processor::ClaimWrapperProcessor,
};
use plonky2::{field::goldilocks_field::GoldilocksField, plonk::config::PoseidonGoldilocksConfig};

use crate::{
    app::interface::{ClaimOutput, ClaimRequest},
    external_api::gnark_server::GnarkServer,
};

type F = GoldilocksField;
type C = PoseidonGoldilocksConfig;
const D: usize = 2;

pub struct Processor {
    claim_processor: ClaimProcessor<F, C, D>,
    wrapper_processor: ClaimWrapperProcessor,
    gnark_server: GnarkServer,
}

impl Processor {
    pub fn new() -> Self {
        let claim_processor = ClaimProcessor::new();
        let wrapper_processor = ClaimWrapperProcessor::new(&claim_processor.claim_circuit);
        let gnark_server = GnarkServer::new();
        Self {
            claim_processor,
            wrapper_processor,
            gnark_server,
        }
    }

    pub fn validate_and_create_witnesses(
        &self,
        claim_input: &ClaimRequest,
    ) -> Result<(Vec<ClaimInnerValue>, Bytes32)> {
        ensure!(
            !claim_input.claims.is_empty(),
            "Claim request must contain at least one claim"
        );
        let mut values = Vec::new();
        let mut prev_hash = Bytes32::default();
        let deposit_tree_root = claim_input.deposit_tree_root;
        let eligible_tree_root = claim_input.eligible_tree_root;
        for (i, claim) in claim_input.claims.iter().enumerate() {
            let value = ClaimInnerValue::new(
                deposit_tree_root,
                claim.deposit_index,
                claim.deposit_merkle_proof.clone(),
                claim.deposit.clone(),
                eligible_tree_root,
                claim.eligible_index,
                claim.eligible_merkle_proof.clone(),
                claim.eligible_leaf.clone(),
                claim.pubkey,
                claim.salt,
                claim.recipient,
                prev_hash,
            )
            .map_err(|e| anyhow::anyhow!("Claim {} is invalid: {}", i, e))?;
            prev_hash = value.new_claim_hash;
            values.push(value);
        }
        Ok((values, prev_hash))
    }

    // Generate a gnark proof for claims.
    // Receives an array of ClaimInnerValues that have already been validated.
    pub async fn process_prove(&self, values: &[ClaimInnerValue]) -> Result<ClaimOutput> {
        assert!(!values.is_empty());
        let mut claims = Vec::new();
        let mut prev_proof = None;
        for value in values {
            let inner_proof = self
                .claim_processor
                .prove(value, &prev_proof)
                .expect("Failed to generate proof"); // this should never fail
            prev_proof = Some(inner_proof);
            claims.push(value.claim.clone());
        }
        let wrapper_proof = self
            .wrapper_processor
            .prove(prev_proof.as_ref().unwrap())
            .expect("Failed to generate wrapper proof"); // this should never fail
        let gnark_proof = self
            .gnark_server
            .prove(&wrapper_proof)
            .await
            .map_err(|e| anyhow::anyhow!("Failed gnark prove: {}", e))?;

        // convert public inputs

        let last_claim_hash = values.last().unwrap().new_claim_hash;
        let pis = ClaimPublicInputs {
            deposit_tree_root: values[0].deposit_tree_root,
            eligible_tree_root: values[0].deposit_tree_root,
            last_claim_hash,
        };
        Ok(ClaimOutput {
            claim_chain: claims,
            pis,
            proof: "0x".to_string() + &hex::encode(gnark_proof.proof),
        })
    }
}
