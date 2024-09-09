use intmax2_zkp::{
    ethereum_types::{
        address::{Address, AddressTarget, ADDRESS_LEN},
        bytes32::{Bytes32, Bytes32Target, BYTES32_LEN},
        u256::{U256Target, U256, U256_LEN},
        u32limb_trait::{U32LimbTargetTrait as _, U32LimbTrait},
    },
    utils::poseidon_hash_out::PoseidonHashOutTarget,
};
use plonky2::{
    field::{extension::Extendable, types::Field},
    hash::hash_types::RichField,
    iop::{target::Target, witness::WitnessWrite},
    plonk::{
        circuit_builder::CircuitBuilder,
        config::{AlgebraicHasher, GenericConfig},
    },
};
use plonky2_keccak::{builder::BuilderKeccak256 as _, utils::solidity_keccak256};
use serde::{Deserialize, Serialize};

pub const MINING_CLAIM_LEN: usize = ADDRESS_LEN + BYTES32_LEN + U256_LEN;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MiningClaim {
    pub recipient: Address,
    pub nullifier: Bytes32,
    pub amount: U256,
}

impl MiningClaim {
    pub fn to_u32_vec(&self) -> Vec<u32> {
        let result = vec![
            self.recipient.to_u32_vec(),
            self.nullifier.to_u32_vec(),
            self.amount.to_u32_vec(),
        ]
        .concat();
        assert_eq!(result.len(), MINING_CLAIM_LEN);
        result
    }

    pub fn from_u32_slice(input: &[u32]) -> Self {
        assert_eq!(input.len(), MINING_CLAIM_LEN);
        let recipient = Address::from_u32_slice(&input[0..ADDRESS_LEN]);
        let nullifier = Bytes32::from_u32_slice(&input[ADDRESS_LEN..ADDRESS_LEN + BYTES32_LEN]);
        let amount = U256::from_u32_slice(&input[ADDRESS_LEN + BYTES32_LEN..]);
        Self {
            recipient,
            nullifier,
            amount,
        }
    }

    pub fn hash_with_prev_hash(&self, prev_hash: Bytes32) -> Bytes32 {
        let input = vec![prev_hash.to_u32_vec(), self.to_u32_vec()].concat();
        Bytes32::from_u32_slice(&solidity_keccak256(&input))
    }
}

#[derive(Clone, Debug)]
pub struct MiningClaimTarget {
    pub recipient: AddressTarget,
    pub nullifier: Bytes32Target,
    pub amount: U256Target,
}

impl MiningClaimTarget {
    pub fn to_vec(&self) -> Vec<Target> {
        let result = vec![
            self.recipient.to_vec(),
            self.nullifier.to_vec(),
            self.amount.to_vec(),
        ]
        .concat();
        assert_eq!(result.len(), MINING_CLAIM_LEN);
        result
    }

    pub fn from_u32_slice(input: &[Target]) -> Self {
        assert_eq!(input.len(), MINING_CLAIM_LEN);
        let recipient = AddressTarget::from_slice(&input[0..ADDRESS_LEN]);
        let nullifier = Bytes32Target::from_slice(&input[ADDRESS_LEN..ADDRESS_LEN + BYTES32_LEN]);
        let amount = U256Target::from_slice(&input[ADDRESS_LEN + BYTES32_LEN..]);
        Self {
            recipient,
            nullifier,
            amount,
        }
    }

    pub fn set_witness<F: Field, W: WitnessWrite<F>>(&self, witness: &mut W, value: &MiningClaim) {
        self.recipient.set_witness(witness, value.recipient);
        self.nullifier.set_witness(witness, value.nullifier);
        self.amount.set_witness(witness, value.amount);
    }

    pub fn commitment<F: RichField + Extendable<D>, const D: usize>(
        &self,
        builder: &mut CircuitBuilder<F, D>,
    ) {
        PoseidonHashOutTarget::hash_inputs(builder, &self.to_vec());
    }

    pub fn hash_with_prev_hash<
        F: RichField + Extendable<D>,
        C: GenericConfig<D, F = F> + 'static,
        const D: usize,
    >(
        &self,
        builder: &mut CircuitBuilder<F, D>,
        prev_hash: Bytes32Target,
    ) -> Bytes32Target
    where
        <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
    {
        let input = vec![prev_hash.to_vec(), self.to_vec()].concat();
        Bytes32Target::from_slice(&builder.keccak256::<C>(&input))
    }
}
