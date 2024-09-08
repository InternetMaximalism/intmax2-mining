use anyhow::Result;
use plonky2::{
    field::extension::Extendable,
    gates::noop::NoopGate,
    hash::hash_types::RichField,
    iop::{
        target::{BoolTarget, Target},
        witness::{PartialWitness, WitnessWrite as _},
    },
    plonk::{
        circuit_builder::CircuitBuilder,
        circuit_data::{CircuitConfig, CircuitData, CommonCircuitData, VerifierCircuitTarget},
        config::{AlgebraicHasher, GenericConfig},
        proof::{ProofWithPublicInputs, ProofWithPublicInputsTarget},
    },
    recursion::dummy_circuit::cyclic_base_proof,
};

use intmax2_zkp::{
    ethereum_types::{
        bytes32::{Bytes32, Bytes32Target, BYTES32_LEN},
        u32limb_trait::{U32LimbTargetTrait, U32LimbTrait as _},
    },
    utils::{
        conversion::{ToField, ToU64},
        cyclic::{vd_from_pis_slice_target, vd_vec_len},
        recursively_verifiable::RecursivelyVerifiable as _,
    },
};

use crate::claim::claim_inner_circuit::ClaimInnerPublicInputsTarget;

use super::claim_inner_circuit::{ClaimInnerCircuit, ClaimInnerPublicInputs};

pub const CLAIM_PUBLIC_INPUTS_LEN: usize = 3 * BYTES32_LEN;

#[derive(Debug, Clone)]
pub struct ClaimPublicInputs {
    pub deposit_tree_root: Bytes32,
    pub eligible_tree_root: Bytes32,
    pub last_claim_hash: Bytes32,
}

impl ClaimPublicInputs {
    pub fn to_u32_vec(&self) -> Vec<u32> {
        let result = vec![
            self.deposit_tree_root.to_u32_vec(),
            self.eligible_tree_root.to_u32_vec(),
            self.last_claim_hash.to_u32_vec(),
        ]
        .concat();
        assert_eq!(result.len(), CLAIM_PUBLIC_INPUTS_LEN);
        result
    }

    pub fn from_u32_slice(input: &[u32]) -> Self {
        assert_eq!(input.len(), CLAIM_PUBLIC_INPUTS_LEN);
        let deposit_tree_root = Bytes32::from_u32_slice(&input[0..BYTES32_LEN]);
        let eligible_tree_root = Bytes32::from_u32_slice(&input[BYTES32_LEN..2 * BYTES32_LEN]);
        let last_claim_hash = Bytes32::from_u32_slice(&input[2 * BYTES32_LEN..3 * BYTES32_LEN]);
        Self {
            deposit_tree_root,
            eligible_tree_root,
            last_claim_hash,
        }
    }

    pub fn from_u64_slice(input: &[u64]) -> Self {
        Self::from_u32_slice(
            input
                .into_iter()
                .map(|&x| {
                    assert!(x < u32::MAX as u64);
                    x as u32
                })
                .collect::<Vec<_>>()
                .as_slice(),
        )
    }
}

#[derive(Debug, Clone)]
pub struct ClaimPublicInputsTarget {
    pub deposit_tree_root: Bytes32Target,
    pub eligible_tree_root: Bytes32Target,
    pub last_claim_hash: Bytes32Target,
}

impl ClaimPublicInputsTarget {
    pub fn to_vec(&self) -> Vec<Target> {
        let result = vec![
            self.deposit_tree_root.to_vec(),
            self.eligible_tree_root.to_vec(),
            self.last_claim_hash.to_vec(),
        ]
        .concat();
        assert_eq!(result.len(), CLAIM_PUBLIC_INPUTS_LEN);
        result
    }

    pub fn from_slice(input: &[Target]) -> Self {
        assert_eq!(input.len(), CLAIM_PUBLIC_INPUTS_LEN);
        let deposit_tree_root = Bytes32Target::from_slice(&input[0..BYTES32_LEN]);
        let eligible_tree_root = Bytes32Target::from_slice(&input[BYTES32_LEN..2 * BYTES32_LEN]);
        let last_claim_hash = Bytes32Target::from_slice(&input[2 * BYTES32_LEN..3 * BYTES32_LEN]);
        Self {
            deposit_tree_root,
            eligible_tree_root,
            last_claim_hash,
        }
    }
}

#[derive(Debug)]
pub struct ClaimCircuit<F, C, const D: usize>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
{
    pub data: CircuitData<F, C, D>,
    is_first_step: BoolTarget,
    claim_inner_proof: ProofWithPublicInputsTarget<D>,
    prev_proof: ProofWithPublicInputsTarget<D>,
    verifier_data_target: VerifierCircuitTarget,
}

impl<F, C, const D: usize> ClaimCircuit<F, C, D>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F> + 'static,
    C::Hasher: AlgebraicHasher<F>,
{
    pub fn new(claim_inner_circuit: &ClaimInnerCircuit<F, C, D>) -> Self {
        let mut builder = CircuitBuilder::<F, D>::new(CircuitConfig::default());
        let is_first_step = builder.add_virtual_bool_target_safe();
        let is_not_first_step = builder.not(is_first_step);
        let claim_inner_proof = claim_inner_circuit.add_proof_target_and_verify(&mut builder);
        let inner_pis = ClaimInnerPublicInputsTarget::from_slice(&claim_inner_proof.public_inputs);
        let claim_pis = ClaimPublicInputsTarget {
            deposit_tree_root: inner_pis.deposit_tree_root,
            eligible_tree_root: inner_pis.eligible_tree_root,
            last_claim_hash: inner_pis.new_claim_hash,
        };
        builder.register_public_inputs(&claim_pis.to_vec());

        let common_data = common_data_for_claim_circuit::<F, C, D>();
        let verifier_data_target = builder.add_verifier_data_public_inputs();

        let prev_proof = builder.add_virtual_proof_with_pis(&common_data);
        builder
            .conditionally_verify_cyclic_proof_or_dummy::<C>(
                is_not_first_step,
                &prev_proof,
                &common_data,
            )
            .unwrap();
        let prev_pis = ClaimPublicInputsTarget::from_slice(
            &prev_proof.public_inputs[0..CLAIM_PUBLIC_INPUTS_LEN],
        );
        prev_pis
            .deposit_tree_root
            .connect(&mut builder, claim_pis.deposit_tree_root);
        prev_pis
            .eligible_tree_root
            .connect(&mut builder, claim_pis.eligible_tree_root);
        // initial condition
        let zero = Bytes32Target::zero::<F, D, Bytes32>(&mut builder);
        prev_pis
            .last_claim_hash
            .conditional_assert_eq(&mut builder, zero, is_first_step);

        let (data, success) = builder.try_build_with_options::<C>(true);
        assert_eq!(data.common, common_data);
        assert!(success);
        Self {
            data,
            is_first_step,
            claim_inner_proof,
            prev_proof,
            verifier_data_target,
        }
    }

    pub fn prove(
        &self,
        claim_inner_proof: &ProofWithPublicInputs<F, C, D>,
        prev_proof: &Option<ProofWithPublicInputs<F, C, D>>,
    ) -> Result<ProofWithPublicInputs<F, C, D>> {
        let mut pw = PartialWitness::<F>::new();
        pw.set_verifier_data_target(&self.verifier_data_target, &self.data.verifier_only);
        pw.set_proof_with_pis_target(&self.claim_inner_proof, claim_inner_proof);
        if prev_proof.is_none() {
            let inner_pis = ClaimInnerPublicInputs::from_u64_slice(
                &claim_inner_proof.public_inputs.to_u64_vec(),
            );
            let initial_pis = ClaimPublicInputs {
                deposit_tree_root: inner_pis.deposit_tree_root,
                eligible_tree_root: inner_pis.eligible_tree_root.into(),
                last_claim_hash: Bytes32::zero(),
            };
            let dummy_proof = cyclic_base_proof(
                &self.data.common,
                &self.data.verifier_only,
                initial_pis
                    .to_u32_vec()
                    .into_iter()
                    .map(|x| x as u64)
                    .collect::<Vec<_>>()
                    .to_field_vec::<F>()
                    .into_iter()
                    .enumerate()
                    .collect(),
            );
            pw.set_bool_target(self.is_first_step, true);
            pw.set_proof_with_pis_target(&self.prev_proof, &dummy_proof);
        } else {
            pw.set_bool_target(self.is_first_step, false);
            pw.set_proof_with_pis_target(&self.prev_proof, prev_proof.as_ref().unwrap());
        }
        self.data.prove(pw)
    }

    pub(crate) fn add_proof_target_and_verify(
        &self,
        builder: &mut CircuitBuilder<F, D>,
    ) -> ProofWithPublicInputsTarget<D> {
        let proof = builder.add_virtual_proof_with_pis(&self.data.common);
        let vd_target = builder.constant_verifier_data(&self.data.verifier_only);
        let inner_vd_target =
            vd_from_pis_slice_target(&proof.public_inputs, &self.data.common.config).unwrap();
        builder.connect_hashes(vd_target.circuit_digest, inner_vd_target.circuit_digest);
        builder.connect_merkle_caps(
            &vd_target.constants_sigmas_cap,
            &inner_vd_target.constants_sigmas_cap,
        );
        builder.verify_proof::<C>(&proof, &vd_target, &self.data.common);
        proof
    }
}

// Generates `CommonCircuitData` for the cyclic circuit
fn common_data_for_claim_circuit<
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
    const D: usize,
>() -> CommonCircuitData<F, D>
where
    C::Hasher: AlgebraicHasher<F>,
{
    let builder = CircuitBuilder::<F, D>::new(CircuitConfig::default());
    let data = builder.build::<C>();

    let mut builder = CircuitBuilder::<F, D>::new(CircuitConfig::default());
    let proof = builder.add_virtual_proof_with_pis(&data.common);
    let verifier_data = VerifierCircuitTarget {
        constants_sigmas_cap: builder.add_virtual_cap(data.common.config.fri_config.cap_height),
        circuit_digest: builder.add_virtual_hash(),
    };
    builder.verify_proof::<C>(&proof, &verifier_data, &data.common);
    let data = builder.build::<C>();

    let mut builder = CircuitBuilder::<F, D>::new(CircuitConfig::default());
    let proof = builder.add_virtual_proof_with_pis(&data.common);
    let verifier_data = VerifierCircuitTarget {
        constants_sigmas_cap: builder.add_virtual_cap(data.common.config.fri_config.cap_height),
        circuit_digest: builder.add_virtual_hash(),
    };
    builder.verify_proof::<C>(&proof, &verifier_data, &data.common);
    while builder.num_gates() < 1 << 13 {
        builder.add_gate(NoopGate, vec![]);
    }
    let mut common = builder.build::<C>().common;
    common.num_public_inputs = CLAIM_PUBLIC_INPUTS_LEN + vd_vec_len(&common.config);
    common
}
