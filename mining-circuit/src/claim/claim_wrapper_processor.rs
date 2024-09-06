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

#[cfg(test)]
mod tests {
    use crate::{
        claim::{
            claim_inner_circuit::ClaimInnerValue, claim_processor::ClaimProcessor,
            claim_wrapper_processor::ClaimWrapperProcessor,
        },
        eligible_tree::{EligibleLeaf, EligibleTree, ELIGIBLE_TREE_HEIGHT},
        save::{save_circuit_data, save_proof},
    };
    use intmax2_zkp::{
        common::{
            deposit::{get_pubkey_salt_hash, Deposit},
            salt::Salt,
            trees::deposit_tree::DepositTree,
        },
        constants::DEPOSIT_TREE_HEIGHT,
        ethereum_types::{
            address::Address, bytes32::Bytes32, u256::U256, u32limb_trait::U32LimbTrait as _,
        },
    };
    use rand::Rng;

    #[test]
    fn wrap_claim() {
        let n = 10;
        let mut rng = rand::thread_rng();
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
                amount: 1,
            };
            eligible_tree.push(eligible_leaf);
        }

        let deposit_tree_root = deposit_tree.get_root();
        let eligible_tree_root = eligible_tree.get_root();

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
        );

        let processor = ClaimProcessor::new();
        let inner_proof = processor.prove(&claim_inner_value, &None).unwrap();

        let wrapper_processor = ClaimWrapperProcessor::new(&processor.claim_circuit);
        let wrapper_proof = wrapper_processor.prove(&inner_proof).unwrap();

        save_circuit_data(
            "./claim_circuit_data/",
            &wrapper_processor.wrapper_circuit1.data,
        )
        .expect("save failed");
        save_proof("./claim_circuit_data/", &wrapper_proof).expect("save failed");
    }
}
