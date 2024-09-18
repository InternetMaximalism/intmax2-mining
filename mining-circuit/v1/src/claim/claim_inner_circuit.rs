use anyhow::ensure;
use intmax2_zkp::{
    common::{
        deposit::{get_pubkey_salt_hash, get_pubkey_salt_hash_circuit, Deposit, DepositTarget},
        salt::{Salt, SaltTarget},
        trees::deposit_tree::{DepositMerkleProof, DepositMerkleProofTarget},
    },
    constants::DEPOSIT_TREE_HEIGHT,
    ethereum_types::{
        address::{Address, AddressTarget},
        bytes32::{Bytes32, Bytes32Target, BYTES32_LEN},
        u256::{U256Target, U256},
        u32limb_trait::{U32LimbTargetTrait, U32LimbTrait},
    },
    utils::{
        poseidon_hash_out::{PoseidonHashOut, PoseidonHashOutTarget},
        recursively_verifiable::RecursivelyVerifiable,
    },
};
use plonky2::{
    field::extension::Extendable,
    hash::hash_types::RichField,
    iop::{
        target::Target,
        witness::{PartialWitness, WitnessWrite},
    },
    plonk::{
        circuit_builder::CircuitBuilder,
        circuit_data::{CircuitConfig, CircuitData},
        config::{AlgebraicHasher, GenericConfig},
        proof::ProofWithPublicInputs,
    },
};
use serde::{Deserialize, Serialize};

use crate::eligible_tree::{
    EligibleLeaf, EligibleLeafTarget, EligibleMerkleProof, EligibleMerkleProofTarget,
};

use super::mining_claim::{MiningClaim, MiningClaimTarget};

pub const CLAIM_INNER_PUBLIC_INPUTS_LEN: usize = 4 * BYTES32_LEN;

#[derive(Debug, Clone)]
pub struct ClaimInnerPublicInputs {
    pub deposit_tree_root: Bytes32,
    pub eligible_tree_root: Bytes32,
    pub prev_claim_hash: Bytes32,
    pub new_claim_hash: Bytes32,
}

impl ClaimInnerPublicInputs {
    pub fn to_u32_vec(&self) -> Vec<u32> {
        let result = vec![
            self.deposit_tree_root.to_u32_vec(),
            self.eligible_tree_root.to_u32_vec(),
            self.prev_claim_hash.to_u32_vec(),
            self.new_claim_hash.to_u32_vec(),
        ]
        .concat();
        assert_eq!(result.len(), CLAIM_INNER_PUBLIC_INPUTS_LEN);
        result
    }

    pub fn from_u32_slice(input: &[u32]) -> Self {
        assert_eq!(input.len(), CLAIM_INNER_PUBLIC_INPUTS_LEN);
        let deposit_tree_root = Bytes32::from_u32_slice(&input[0..BYTES32_LEN]);
        let eligible_tree_root = Bytes32::from_u32_slice(&input[BYTES32_LEN..2 * BYTES32_LEN]);
        let prev_claim_hash = Bytes32::from_u32_slice(&input[2 * BYTES32_LEN..3 * BYTES32_LEN]);
        let new_claim_hash = Bytes32::from_u32_slice(&input[3 * BYTES32_LEN..4 * BYTES32_LEN]);
        Self {
            deposit_tree_root,
            eligible_tree_root,
            prev_claim_hash,
            new_claim_hash,
        }
    }

    pub fn from_u64_slice(input: &[u64]) -> Self {
        let input_u32 = input
            .iter()
            .map(|x| {
                assert!(*x <= u32::MAX as u64);
                *x as u32
            })
            .collect::<Vec<u32>>();
        Self::from_u32_slice(&input_u32)
    }
}

#[derive(Debug, Clone)]
pub struct ClaimInnerPublicInputsTarget {
    pub deposit_tree_root: Bytes32Target,
    pub eligible_tree_root: Bytes32Target,
    pub prev_claim_hash: Bytes32Target,
    pub new_claim_hash: Bytes32Target,
}

impl ClaimInnerPublicInputsTarget {
    pub fn to_vec(&self) -> Vec<Target> {
        let result = vec![
            self.deposit_tree_root.to_vec(),
            self.eligible_tree_root.to_vec(),
            self.prev_claim_hash.to_vec(),
            self.new_claim_hash.to_vec(),
        ]
        .concat();
        assert_eq!(result.len(), CLAIM_INNER_PUBLIC_INPUTS_LEN);
        result
    }

    pub fn from_slice(input: &[Target]) -> Self {
        assert_eq!(input.len(), CLAIM_INNER_PUBLIC_INPUTS_LEN);
        let deposit_tree_root = Bytes32Target::from_slice(&input[0..BYTES32_LEN]);
        let eligible_tree_root = Bytes32Target::from_slice(&input[BYTES32_LEN..2 * BYTES32_LEN]);
        let prev_claim_hash = Bytes32Target::from_slice(&input[2 * BYTES32_LEN..3 * BYTES32_LEN]);
        let new_claim_hash = Bytes32Target::from_slice(&input[3 * BYTES32_LEN..4 * BYTES32_LEN]);
        Self {
            deposit_tree_root,
            eligible_tree_root,
            prev_claim_hash,
            new_claim_hash,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaimInnerValue {
    pub deposit_tree_root: Bytes32,
    pub deposit_index: u32,
    pub deposit_merkle_proof: DepositMerkleProof,
    pub deposit: Deposit,
    pub eligible_tree_root: Bytes32,
    pub eligible_index: u32,
    pub eligible_merkle_proof: EligibleMerkleProof,
    pub eligible_leaf: EligibleLeaf,
    pub pubkey: U256,
    pub salt: Salt,
    pub prev_claim_hash: Bytes32,
    pub new_claim_hash: Bytes32,
    pub claim: MiningClaim,
}

impl ClaimInnerValue {
    pub fn new(
        deposit_tree_root: Bytes32,
        deposit_index: u32,
        deposit_merkle_proof: DepositMerkleProof,
        deposit: Deposit,
        eligible_tree_root: Bytes32,
        eligible_index: u32,
        eligible_merkle_proof: EligibleMerkleProof,
        eligible_leaf: EligibleLeaf,
        pubkey: U256,
        salt: Salt,
        recipient: Address,
        prev_claim_hash: Bytes32,
    ) -> anyhow::Result<Self> {
        // verify inclusion of deposit & eligible tree
        deposit_merkle_proof.verify(&deposit, deposit_index as usize, deposit_tree_root)?;
        let eligible_tree_root_pos = eligible_tree_root.reduce_to_hash_out();
        eligible_merkle_proof.verify(
            &eligible_leaf,
            eligible_index as usize,
            eligible_tree_root_pos,
        )?;

        // verify the knowledge of salt
        let pubkey_salt_hash = get_pubkey_salt_hash(pubkey, salt);
        ensure!(pubkey_salt_hash == deposit.pubkey_salt_hash);
        let nullifier = get_deposit_nullifier(&deposit, salt);
        let claim = MiningClaim {
            recipient,
            nullifier,
            amount: eligible_leaf.amount,
        };
        let new_claim_hash = claim.hash_with_prev_hash(prev_claim_hash);
        Ok(Self {
            deposit_tree_root,
            deposit_index,
            deposit_merkle_proof,
            deposit,
            eligible_tree_root,
            eligible_index,
            eligible_merkle_proof,
            eligible_leaf,
            pubkey,
            salt,
            prev_claim_hash,
            new_claim_hash,
            claim,
        })
    }
}

#[derive(Debug, Clone)]
pub struct ClaimInnerTarget {
    pub deposit_tree_root: Bytes32Target,
    pub deposit_index: Target,
    pub deposit_merkle_proof: DepositMerkleProofTarget,
    pub deposit: DepositTarget,
    pub eligible_tree_root: Bytes32Target,
    pub eligible_index: Target,
    pub eligible_merkle_proof: EligibleMerkleProofTarget,
    pub eligible_leaf: EligibleLeafTarget,
    pub pubkey: U256Target,
    pub salt: SaltTarget,
    pub prev_claim_hash: Bytes32Target,
    pub new_claim_hash: Bytes32Target,
    pub claim: MiningClaimTarget,
}

impl ClaimInnerTarget {
    pub fn new<F: RichField + Extendable<D>, C: GenericConfig<D, F = F> + 'static, const D: usize>(
        builder: &mut CircuitBuilder<F, D>,
        is_checked: bool,
    ) -> Self
    where
        <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
    {
        let deposit_tree_root = Bytes32Target::new(builder, is_checked);
        let deposit_index = builder.add_virtual_target();
        let deposit_merkle_proof = DepositMerkleProofTarget::new(builder, DEPOSIT_TREE_HEIGHT);
        let deposit = DepositTarget::new(builder, is_checked);
        let eligible_tree_root = Bytes32Target::new(builder, is_checked);
        let eligible_index = builder.add_virtual_target();
        let eligible_merkle_proof = EligibleMerkleProofTarget::new(builder, DEPOSIT_TREE_HEIGHT);
        let eligible_leaf = EligibleLeafTarget::new(builder, is_checked);
        let pubkey = U256Target::new(builder, is_checked);
        let salt = SaltTarget::new(builder);
        let recipient = AddressTarget::new(builder, is_checked);
        let prev_claim_hash = Bytes32Target::new(builder, is_checked);
        if is_checked {
            builder.range_check(deposit_index, 32);
            builder.range_check(eligible_index, 32);
        }
        deposit_merkle_proof.verify::<F, C, D>(builder, &deposit, deposit_index, deposit_tree_root);
        let eligible_tree_root_pos = eligible_tree_root.reduce_to_hash_out(builder);
        eligible_merkle_proof.verify::<F, C, D>(
            builder,
            &eligible_leaf,
            eligible_index,
            eligible_tree_root_pos,
        );
        let pubkey_salt_hash = get_pubkey_salt_hash_circuit(builder, pubkey, salt);
        pubkey_salt_hash.connect(builder, deposit.pubkey_salt_hash);
        let nullifier = get_deposit_nullifier_circuit(builder, &deposit, salt);
        let claim = MiningClaimTarget {
            recipient,
            nullifier,
            amount: eligible_leaf.amount,
        };
        let new_claim_hash = claim.hash_with_prev_hash::<F, C, D>(builder, prev_claim_hash);
        Self {
            deposit_tree_root,
            deposit_index,
            deposit_merkle_proof,
            deposit,
            eligible_tree_root,
            eligible_index,
            eligible_merkle_proof,
            eligible_leaf,
            pubkey,
            salt,
            prev_claim_hash,
            new_claim_hash,
            claim,
        }
    }

    pub fn set_witness<F: RichField + Extendable<D>, W: WitnessWrite<F>, const D: usize>(
        &self,
        witness: &mut W,
        value: &ClaimInnerValue,
    ) {
        self.deposit_tree_root
            .set_witness(witness, value.deposit_tree_root);
        witness.set_target(
            self.deposit_index,
            F::from_canonical_u32(value.deposit_index),
        );
        self.deposit_merkle_proof
            .set_witness(witness, &value.deposit_merkle_proof);
        self.deposit.set_witness(witness, &value.deposit);
        self.eligible_tree_root
            .set_witness(witness, value.eligible_tree_root);
        witness.set_target(
            self.eligible_index,
            F::from_canonical_u32(value.eligible_index),
        );
        self.eligible_merkle_proof
            .set_witness(witness, &value.eligible_merkle_proof);
        self.eligible_leaf
            .set_witness(witness, &value.eligible_leaf);
        self.pubkey.set_witness(witness, value.pubkey);
        self.salt.set_witness(witness, value.salt);
        self.prev_claim_hash
            .set_witness(witness, value.prev_claim_hash);
        self.new_claim_hash
            .set_witness(witness, value.new_claim_hash);
        self.claim.set_witness(witness, &value.claim);
    }
}

#[derive(Debug)]
pub struct ClaimInnerCircuit<F, C, const D: usize>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
{
    data: CircuitData<F, C, D>,
    target: ClaimInnerTarget,
}

impl<F, C, const D: usize> ClaimInnerCircuit<F, C, D>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F> + 'static,
    C::Hasher: AlgebraicHasher<F>,
{
    pub fn new() -> Self {
        let mut builder =
            CircuitBuilder::<F, D>::new(CircuitConfig::standard_recursion_zk_config());
        let target = ClaimInnerTarget::new::<F, C, D>(&mut builder, true);
        let pis = ClaimInnerPublicInputsTarget {
            deposit_tree_root: target.deposit_tree_root,
            eligible_tree_root: target.eligible_tree_root,
            prev_claim_hash: target.prev_claim_hash,
            new_claim_hash: target.new_claim_hash,
        };
        builder.register_public_inputs(&pis.to_vec());
        let data = builder.build();
        Self { data, target }
    }

    pub fn prove(&self, value: &ClaimInnerValue) -> anyhow::Result<ProofWithPublicInputs<F, C, D>> {
        let mut pw = PartialWitness::<F>::new();
        self.target.set_witness(&mut pw, value);
        self.data.prove(pw)
    }
}

impl<F: RichField + Extendable<D>, C: GenericConfig<D, F = F> + 'static, const D: usize>
    RecursivelyVerifiable<F, C, D> for ClaimInnerCircuit<F, C, D>
where
    <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
{
    fn circuit_data(&self) -> &CircuitData<F, C, D> {
        &self.data
    }
}

pub fn get_deposit_nullifier(deposit: &Deposit, salt: Salt) -> Bytes32 {
    let deposit_commitment = deposit.poseidon_hash();
    let input = [deposit_commitment.to_u64_vec(), salt.to_u64_vec()].concat();
    let input_hash = PoseidonHashOut::hash_inputs_u64(&input);
    let nullifier: Bytes32 = input_hash.into();
    nullifier
}

pub fn get_deposit_nullifier_circuit<F: RichField + Extendable<D>, const D: usize>(
    builder: &mut CircuitBuilder<F, D>,
    deposit: &DepositTarget,
    salt: SaltTarget,
) -> Bytes32Target {
    let deposit_commitment = deposit.poseidon_hash(builder);
    let input = [deposit_commitment.to_vec(), salt.to_vec()].concat();
    let input_hash = PoseidonHashOutTarget::hash_inputs(builder, &input);
    let nullifier = Bytes32Target::from_hash_out(builder, input_hash);
    nullifier
}

#[cfg(test)]
mod tests {
    use crate::{
        claim::claim_inner_circuit::{ClaimInnerCircuit, ClaimInnerValue},
        eligible_tree::{EligibleLeaf, EligibleTree, ELIGIBLE_TREE_HEIGHT},
    };
    use intmax2_zkp::{
        common::{
            deposit::{get_pubkey_salt_hash, Deposit},
            salt::Salt,
            trees::deposit_tree::DepositTree,
        },
        constants::DEPOSIT_TREE_HEIGHT,
        ethereum_types::{
            address::Address, bytes32::Bytes32, u256::U256, u32limb_trait::U32LimbTrait,
        },
    };
    use plonky2::plonk::config::{GenericConfig, PoseidonGoldilocksConfig};
    use rand::Rng;

    #[test]
    fn test_claim_inner_circuit() {
        const D: usize = 2;
        type C = PoseidonGoldilocksConfig;
        type F = <C as GenericConfig<D>>::F;

        let mut rng = rand::thread_rng();
        let n = 10; // number of deposits

        // construct the deposit tree
        let mut deposit_tree = DepositTree::new(DEPOSIT_TREE_HEIGHT);

        // deposits
        let mut pubkeys_and_salts = vec![];
        for _ in 0..n {
            let pubkey = U256::rand(&mut rng);
            let salt = Salt::rand(&mut rng);
            let pubkey_salt_hash = get_pubkey_salt_hash(pubkey, salt);
            let deposit = Deposit {
                pubkey_salt_hash,
                token_index: 0,
                amount: U256::from(100),
            };
            deposit_tree.push(deposit);
            pubkeys_and_salts.push((pubkey, salt));
        }

        // construct eligible tree
        let mut eligible_tree = EligibleTree::new(ELIGIBLE_TREE_HEIGHT);
        for deposit_index in 0..n {
            let eligible_leaf = EligibleLeaf {
                deposit_index,
                amount: U256::from(1),
            };
            eligible_tree.push(eligible_leaf);
        }

        let deposit_tree_root = deposit_tree.get_root();
        let eligible_tree_root: Bytes32 = eligible_tree.get_root().into();

        // select specified deposit index
        let deposit_index = rng.gen_range(0..n);
        let (pubkey, salt) = pubkeys_and_salts[deposit_index as usize];

        let deposit_merkle_proof = deposit_tree.prove(deposit_index as usize);
        let deposit = deposit_tree.get_leaf(deposit_index as usize);

        let eligible_index = deposit_index; // for now
        let eligible_merkle_proof = eligible_tree.prove(eligible_index as usize);
        let eligible_leaf = eligible_tree.get_leaf(eligible_index as usize);
        assert_eq!(eligible_leaf.deposit_index, deposit_index);

        let recipient = Address::rand(&mut rng);
        let prev_claim_hash = Bytes32::zero();

        let claim_inner_value = ClaimInnerValue::new(
            deposit_tree_root,
            deposit_index,
            deposit_merkle_proof,
            deposit,
            eligible_tree_root,
            eligible_index,
            eligible_merkle_proof,
            eligible_leaf,
            pubkey,
            salt,
            recipient,
            prev_claim_hash,
        )
        .unwrap();

        let claim_inner_circuit = ClaimInnerCircuit::<F, C, D>::new();
        let _proof = claim_inner_circuit.prove(&claim_inner_value).unwrap();
    }
}
