use anyhow::Result;
use plonky2::{
    field::extension::Extendable,
    hash::hash_types::RichField,
    plonk::{
        config::{AlgebraicHasher, GenericConfig},
        proof::ProofWithPublicInputs,
    },
};

use super::{
    claim_circuit::ClaimCircuit,
    claim_inner_circuit::{ClaimInnerCircuit, ClaimInnerValue},
};

pub struct ClaimProcessor<F, C, const D: usize>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
{
    pub claim_inner_circuit: ClaimInnerCircuit<F, C, D>,
    pub claim_circuit: ClaimCircuit<F, C, D>,
}

impl<F, C, const D: usize> ClaimProcessor<F, C, D>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F> + 'static,
    <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
{
    pub fn new() -> Self {
        let claim_inner_circuit = ClaimInnerCircuit::new();
        let claim_circuit = ClaimCircuit::new(&claim_inner_circuit);
        Self {
            claim_inner_circuit,
            claim_circuit,
        }
    }

    pub fn prove(
        &self,
        claim_value: &ClaimInnerValue,
        prev_claim_proof: &Option<ProofWithPublicInputs<F, C, D>>,
    ) -> Result<ProofWithPublicInputs<F, C, D>> {
        let claim_inner_proof = self.claim_inner_circuit.prove(claim_value)?;
        let claim_proof = self
            .claim_circuit
            .prove(&claim_inner_proof, prev_claim_proof)?;
        Ok(claim_proof)
    }
}
