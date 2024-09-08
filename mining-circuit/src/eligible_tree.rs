use intmax2_zkp::{
    ethereum_types::{
        u256::{U256Target, U256, U256_LEN},
        u32limb_trait::{U32LimbTargetTrait, U32LimbTrait},
    },
    utils::{
        leafable::{Leafable, LeafableTarget},
        leafable_hasher::PoseidonLeafableHasher,
        poseidon_hash_out::{PoseidonHashOut, PoseidonHashOutTarget},
        trees::incremental_merkle_tree::{
            IncrementalMerkleProof, IncrementalMerkleProofTarget, IncrementalMerkleTree,
        },
    },
};
use plonky2::{
    field::extension::Extendable,
    hash::hash_types::RichField,
    iop::{target::Target, witness::WitnessWrite},
    plonk::{
        circuit_builder::CircuitBuilder,
        config::{AlgebraicHasher, GenericConfig},
    },
};
use serde::{Deserialize, Serialize};

pub const ELIGIBLE_LEAF_LEN: usize = 1 + U256_LEN;
pub const ELIGIBLE_TREE_HEIGHT: usize = 32;

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct EligibleLeaf {
    pub deposit_index: u32, // eligible deposit index.
    pub amount: U256,       // amount of mining reward for that index.
}

impl EligibleLeaf {
    pub fn to_u32_vec(&self) -> Vec<u32> {
        let result = vec![vec![self.deposit_index], self.amount.to_u32_vec()].concat();
        assert_eq!(result.len(), ELIGIBLE_LEAF_LEN);
        result
    }
}

#[derive(Debug, Clone)]
pub struct EligibleLeafTarget {
    pub deposit_index: Target,
    pub amount: U256Target,
}

impl EligibleLeafTarget {
    pub fn new<F: RichField + Extendable<D>, const D: usize>(
        builder: &mut CircuitBuilder<F, D>,
        is_checked: bool,
    ) -> Self {
        let deposit_index = builder.add_virtual_target();
        let amount = U256Target::new(builder, is_checked);
        if is_checked {
            builder.range_check(deposit_index, 32);
        }
        Self {
            deposit_index,
            amount,
        }
    }

    pub fn to_vec(&self) -> Vec<Target> {
        let result = vec![vec![self.deposit_index], self.amount.to_vec()].concat();
        assert_eq!(result.len(), ELIGIBLE_LEAF_LEN);
        result
    }

    pub fn constant<F: RichField + Extendable<D>, const D: usize>(
        builder: &mut CircuitBuilder<F, D>,
        value: &EligibleLeaf,
    ) -> Self {
        Self {
            deposit_index: builder.constant(F::from_canonical_u32(value.deposit_index)),
            amount: U256Target::constant(builder, value.amount),
        }
    }

    pub fn set_witness<F: RichField, W: WitnessWrite<F>>(
        &self,
        witness: &mut W,
        value: &EligibleLeaf,
    ) {
        witness.set_target(
            self.deposit_index,
            F::from_canonical_u32(value.deposit_index),
        );
        self.amount.set_witness(witness, value.amount);
    }
}

impl Leafable for EligibleLeaf {
    type LeafableHasher = PoseidonLeafableHasher;

    fn empty_leaf() -> Self {
        Self::default()
    }

    fn hash(&self) -> PoseidonHashOut {
        PoseidonHashOut::hash_inputs_u32(&self.to_u32_vec())
    }
}

impl LeafableTarget for EligibleLeafTarget {
    type Leaf = EligibleLeaf;

    fn empty_leaf<F: RichField + Extendable<D>, const D: usize>(
        builder: &mut CircuitBuilder<F, D>,
    ) -> Self {
        let empty_leaf = <Self::Leaf as Leafable>::empty_leaf();
        Self::constant(builder, &empty_leaf)
    }

    fn hash<F: RichField + Extendable<D>, C: GenericConfig<D, F = F> + 'static, const D: usize>(
        &self,
        builder: &mut CircuitBuilder<F, D>,
    ) -> PoseidonHashOutTarget
    where
        <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
    {
        PoseidonHashOutTarget::hash_inputs(builder, &self.to_vec())
    }
}

pub type EligibleTree = IncrementalMerkleTree<EligibleLeaf>;
pub type EligibleMerkleProof = IncrementalMerkleProof<EligibleLeaf>;
pub type EligibleMerkleProofTarget = IncrementalMerkleProofTarget<EligibleLeafTarget>;
