use plonky2::{
    field::{extension::Extendable, types::Field},
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
use plonky2_keccak::{builder::BuilderKeccak256, utils::solidity_keccak256};
use serde::{Deserialize, Serialize};

use intmax2_zkp::{
    common::{
        deposit::{get_pubkey_salt_hash, get_pubkey_salt_hash_circuit, Deposit, DepositTarget},
        salt::{Salt, SaltTarget},
        trees::deposit_tree::{DepositMerkleProof, DepositMerkleProofTarget},
    },
    constants::DEPOSIT_TREE_HEIGHT,
    ethereum_types::{
        address::{Address, AddressTarget},
        bytes32::{Bytes32, Bytes32Target},
        u256::{U256Target, U256},
        u32limb_trait::{U32LimbTargetTrait as _, U32LimbTrait as _},
    },
    utils::recursively_verifiable::RecursivelyVerifiable,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleWithdrawalPublicInputs {
    pub deposit_root: Bytes32,
    pub nullifier: Bytes32,
    pub recipient: Address,
    pub token_index: u32,
    pub amount: U256,
}

#[derive(Debug, Clone)]
pub struct SimpleWithdrawalPublicInputsTarget {
    pub deposit_root: Bytes32Target,
    pub nullifier: Bytes32Target,
    pub recipient: AddressTarget,
    pub token_index: Target,
    pub amount: U256Target,
}

impl SimpleWithdrawalPublicInputs {
    pub fn to_u32_vec(&self) -> Vec<u32> {
        let vec = vec![
            self.deposit_root.to_u32_vec(),
            self.nullifier.to_u32_vec(),
            self.recipient.to_u32_vec(),
            vec![self.token_index],
            self.amount.to_u32_vec(),
        ]
        .concat();
        vec
    }

    pub fn hash(&self) -> Bytes32 {
        let vec = self.to_u32_vec();
        Bytes32::from_u32_slice(&solidity_keccak256(&vec))
    }
}

impl SimpleWithdrawalPublicInputsTarget {
    pub fn to_vec(&self) -> Vec<Target> {
        let vec = vec![
            self.deposit_root.to_vec(),
            self.nullifier.to_vec(),
            self.recipient.to_vec(),
            vec![self.token_index],
            self.amount.to_vec(),
        ]
        .concat();
        vec
    }

    pub fn hash<
        F: RichField + Extendable<D>,
        C: GenericConfig<D, F = F> + 'static,
        const D: usize,
    >(
        &self,
        builder: &mut CircuitBuilder<F, D>,
    ) -> Bytes32Target
    where
        <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
    {
        let inputs = self.to_vec();
        Bytes32Target::from_slice(&builder.keccak256::<C>(&inputs))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleWithdrawalValue {
    pub deposit_root: Bytes32,
    pub deposit_index: u32,
    pub deposit_leaf: Deposit,
    pub deposit_merkle_proof: DepositMerkleProof,
    pub recipient: Address,
    pub nullifier: Bytes32,
    pub pubkey: U256,
    pub salt: Salt,
}

pub struct SimpleWithdrawalTarget {
    pub deposit_root: Bytes32Target,
    pub deposit_index: Target,
    pub deposit_leaf: DepositTarget,
    pub deposit_merkle_proof: DepositMerkleProofTarget,
    pub recipient: AddressTarget,
    pub nullifier: Bytes32Target,
    pub pubkey: U256Target,
    pub salt: SaltTarget,
}

impl SimpleWithdrawalValue {
    pub fn new(
        deposit_root: Bytes32,
        deposit_index: u32,
        deposit_leaf: Deposit,
        deposit_merkle_proof: DepositMerkleProof,
        recipient: Address,
        pubkey: U256,
        salt: Salt,
    ) -> Self {
        let pubkey_salt_hash = get_pubkey_salt_hash(pubkey, salt);
        assert_eq!(
            pubkey_salt_hash, deposit_leaf.pubkey_salt_hash,
            "pubkey_salt_hash mismatch"
        );
        deposit_merkle_proof
            .verify(&deposit_leaf, deposit_index as usize, deposit_root)
            .expect("deposit_merkle_proof verify failed");
        let nullifier = get_pubkey_salt_hash(U256::default(), salt);
        Self {
            deposit_root,
            deposit_index,
            deposit_leaf,
            deposit_merkle_proof,
            recipient,
            nullifier,
            pubkey,
            salt,
        }
    }
}

impl SimpleWithdrawalTarget {
    pub fn new<F: RichField + Extendable<D>, C: GenericConfig<D, F = F> + 'static, const D: usize>(
        builder: &mut CircuitBuilder<F, D>,
    ) -> Self
    where
        <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
    {
        let pubkey = U256Target::new(builder, true);
        let salt = SaltTarget::new(builder);
        let deposit_index = builder.add_virtual_target();
        // range check is done on the contract
        let deposit_leaf = DepositTarget::new(builder, false);
        let deposit_merkle_proof = DepositMerkleProofTarget::new(builder, DEPOSIT_TREE_HEIGHT);
        // range check is done on the contracts
        let deposit_root = Bytes32Target::new(builder, false);
        deposit_merkle_proof.verify::<F, C, D>(builder, &deposit_leaf, deposit_index, deposit_root);
        let pubkey_salt_hash = get_pubkey_salt_hash_circuit(builder, pubkey, salt);
        deposit_leaf
            .pubkey_salt_hash
            .connect(builder, pubkey_salt_hash);
        let zero_pubkey = U256Target::zero::<F, D, U256>(builder);
        let nullifier = get_pubkey_salt_hash_circuit(builder, zero_pubkey, salt);
        let recipient = AddressTarget::new(builder, false);
        Self {
            deposit_root,
            deposit_index,
            deposit_leaf,
            deposit_merkle_proof,
            recipient,
            nullifier,
            pubkey,
            salt,
        }
    }

    pub fn set_witness<F: Field, W: WitnessWrite<F>>(
        &self,
        witness: &mut W,
        value: &SimpleWithdrawalValue,
    ) {
        self.deposit_root.set_witness(witness, value.deposit_root);
        witness.set_target(
            self.deposit_index,
            F::from_canonical_u32(value.deposit_index),
        );
        self.deposit_leaf.set_witness(witness, &value.deposit_leaf);
        self.deposit_merkle_proof
            .set_witness(witness, &value.deposit_merkle_proof);
        self.recipient.set_witness(witness, value.recipient);
        self.nullifier.set_witness(witness, value.nullifier);
        self.pubkey.set_witness(witness, value.pubkey);
        self.salt.set_witness(witness, value.salt);
    }
}

pub struct SimpleWithdrawalCircuit<
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
    const D: usize,
> {
    pub target: SimpleWithdrawalTarget,
    pub data: CircuitData<F, C, D>,
}

impl<F: RichField + Extendable<D>, C: GenericConfig<D, F = F> + 'static, const D: usize>
    SimpleWithdrawalCircuit<F, C, D>
where
    <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
{
    pub fn new() -> Self {
        let mut builder = CircuitBuilder::<F, D>::new(CircuitConfig::default());
        let target = SimpleWithdrawalTarget::new::<F, C, D>(&mut builder);
        let pis = SimpleWithdrawalPublicInputsTarget {
            deposit_root: target.deposit_root,
            recipient: target.recipient,
            nullifier: target.nullifier,
            token_index: target.deposit_leaf.token_index,
            amount: target.deposit_leaf.amount,
        };
        let pis_hash = pis.hash::<F, C, D>(&mut builder);
        builder.register_public_inputs(&pis_hash.to_vec());
        let data = builder.build();
        Self { data, target }
    }

    pub fn prove(
        &self,
        value: &SimpleWithdrawalValue,
    ) -> anyhow::Result<ProofWithPublicInputs<F, C, D>> {
        let mut pw = PartialWitness::<F>::new();
        self.target.set_witness(&mut pw, value);
        self.data.prove(pw)
    }
}

impl<F: RichField + Extendable<D>, C: GenericConfig<D, F = F> + 'static, const D: usize>
    RecursivelyVerifiable<F, C, D> for SimpleWithdrawalCircuit<F, C, D>
where
    <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
{
    fn circuit_data(&self) -> &CircuitData<F, C, D> {
        &self.data
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
    use plonky2::{
        field::goldilocks_field::GoldilocksField, plonk::config::PoseidonGoldilocksConfig,
    };
    use rand::Rng;

    use crate::withdrawal::simple_withraw_circuit::{
        SimpleWithdrawalCircuit, SimpleWithdrawalValue,
    };

    type F = GoldilocksField;
    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;

    #[test]
    fn simple_withdrawal() {
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
        let value = SimpleWithdrawalValue::new(
            deposit_tree.get_root(),
            deposit_index as u32,
            deposit,
            deposit_merkle_proof,
            recipient,
            pubkey,
            salt,
        );

        let circuit = SimpleWithdrawalCircuit::<F, C, D>::new();
        let instant = std::time::Instant::now();
        let _proof = circuit.prove(&value).expect("prove failed");
        println!("prove time: {:?}", instant.elapsed());
        dbg!(circuit.data.common.degree_bits());
        dbg!(circuit.data.verifier_only.circuit_digest);
    }
}
