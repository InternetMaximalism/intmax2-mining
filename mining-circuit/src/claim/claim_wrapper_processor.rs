use anyhow::Result;
use plonky2::{
    field::goldilocks_field::GoldilocksField,
    plonk::{config::PoseidonGoldilocksConfig, proof::ProofWithPublicInputs},
};

use intmax2_zkp::{
    utils::wrapper::WrapperCircuit, wrapper_config::plonky2_config::PoseidonBN128GoldilocksConfig,
};

use super::{claim_circuit::ClaimCircuit, claim_wrapper_circuit::ClaimWrapperCircuit};

type F = GoldilocksField;
const D: usize = 2;
type C = PoseidonGoldilocksConfig;
type OuterC = PoseidonBN128GoldilocksConfig;

pub struct ClaimWrapperProcessor {
    pub claim_wrapper_circuit: ClaimWrapperCircuit<F, C, D>,
    pub wrapper_circuit0: WrapperCircuit<F, C, C, D>,
    pub wrapper_circuit1: WrapperCircuit<F, C, OuterC, D>,
}

impl ClaimWrapperProcessor {
    pub fn new(claim_circuit: &ClaimCircuit<F, C, D>) -> Self {
        let claim_wrapper_circuit = ClaimWrapperCircuit::new(claim_circuit);
        let wrapper_circuit0 = WrapperCircuit::new(&claim_wrapper_circuit);
        let wrapper_circuit1 = WrapperCircuit::new(&wrapper_circuit0);
        Self {
            claim_wrapper_circuit,
            wrapper_circuit0,
            wrapper_circuit1,
        }
    }

    pub fn prove(
        &self,
        claim_proof: &ProofWithPublicInputs<F, C, D>,
    ) -> Result<ProofWithPublicInputs<F, OuterC, D>> {
        let withdrawal_wrapper_proof = self.claim_wrapper_circuit.prove(claim_proof)?;
        let wrapper_proof0 = self.wrapper_circuit0.prove(&withdrawal_wrapper_proof)?;
        let wrapper_proof1 = self.wrapper_circuit1.prove(&wrapper_proof0)?;
        Ok(wrapper_proof1)
    }
}
