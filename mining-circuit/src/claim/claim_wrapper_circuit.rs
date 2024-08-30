use plonky2::{
    field::extension::Extendable,
    hash::hash_types::RichField,
    iop::witness::{PartialWitness, WitnessWrite as _},
    plonk::{
        circuit_builder::CircuitBuilder,
        circuit_data::{CircuitConfig, CircuitData},
        config::{AlgebraicHasher, GenericConfig},
        proof::{ProofWithPublicInputs, ProofWithPublicInputsTarget},
    },
};
use plonky2_keccak::builder::BuilderKeccak256 as _;

use intmax2_zkp::{
    ethereum_types::{bytes32::Bytes32Target, u32limb_trait::U32LimbTargetTrait as _},
    utils::recursively_verifiable::RecursivelyVerifiable,
};

use super::claim_circuit::{ClaimCircuit, ClaimPublicInputsTarget};

#[derive(Debug)]
pub struct ClaimWrapperCircuit<F, C, const D: usize>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
{
    data: CircuitData<F, C, D>,
    claim_proof: ProofWithPublicInputsTarget<D>,
}

impl<F, C, const D: usize> ClaimWrapperCircuit<F, C, D>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F> + 'static,
    C::Hasher: AlgebraicHasher<F>,
{
    pub fn new(claim_circuit: &ClaimCircuit<F, C, D>) -> Self {
        let mut builder = CircuitBuilder::<F, D>::new(CircuitConfig::default());
        let claim_proof = claim_circuit.add_proof_target_and_verify(&mut builder);
        let claim_pis = ClaimPublicInputsTarget::from_slice(&claim_proof.public_inputs);
        let pis_hash = Bytes32Target::from_slice(&builder.keccak256::<C>(&claim_pis.to_vec()));
        builder.register_public_inputs(&pis_hash.to_vec());
        let data = builder.build();
        Self { data, claim_proof }
    }

    pub fn prove(
        &self,
        claim_proof: &ProofWithPublicInputs<F, C, D>,
    ) -> anyhow::Result<ProofWithPublicInputs<F, C, D>> {
        let mut pw = PartialWitness::<F>::new();
        pw.set_proof_with_pis_target(&self.claim_proof, claim_proof);
        self.data.prove(pw)
    }
}

impl<F: RichField + Extendable<D>, C: GenericConfig<D, F = F> + 'static, const D: usize>
    RecursivelyVerifiable<F, C, D> for ClaimWrapperCircuit<F, C, D>
where
    <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
{
    fn circuit_data(&self) -> &CircuitData<F, C, D> {
        &self.data
    }
}
