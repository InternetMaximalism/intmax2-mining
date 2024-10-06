use super::simple_withraw_circuit::{SimpleWithdrawalCircuit, SimpleWithdrawalValue};
use anyhow::Result;
use intmax2_zkp::{
    utils::wrapper::WrapperCircuit, wrapper_config::plonky2_config::PoseidonBN128GoldilocksConfig,
};
use plonky2::{
    field::goldilocks_field::GoldilocksField,
    plonk::{config::PoseidonGoldilocksConfig, proof::ProofWithPublicInputs},
};

type F = GoldilocksField;
const D: usize = 2;
type C = PoseidonGoldilocksConfig;
type OuterC = PoseidonBN128GoldilocksConfig;

pub struct SimpleWithdrawalWrapperProcessor {
    pub simple_withdrawal_circuit: SimpleWithdrawalCircuit<F, C, D>,
    pub wrapper_circuit0: WrapperCircuit<F, C, C, D>,
    pub wrapper_circuit1: WrapperCircuit<F, C, OuterC, D>,
}

impl SimpleWithdrawalWrapperProcessor {
    pub fn new() -> Self {
        let simple_withdrawal_circuit = SimpleWithdrawalCircuit::new();
        let wrapper_circuit0 = WrapperCircuit::new(&simple_withdrawal_circuit);
        let wrapper_circuit1 = WrapperCircuit::new(&wrapper_circuit0);
        Self {
            simple_withdrawal_circuit,
            wrapper_circuit0,
            wrapper_circuit1,
        }
    }

    pub fn prove(
        &self,
        value: &SimpleWithdrawalValue,
    ) -> Result<ProofWithPublicInputs<F, OuterC, D>> {
        let simple_withdrawal_proof = self.simple_withdrawal_circuit.prove(value)?;
        let wrapper_proof0 = self.wrapper_circuit0.prove(&simple_withdrawal_proof)?;
        let wrapper_proof1 = self.wrapper_circuit1.prove(&wrapper_proof0)?;
        Ok(wrapper_proof1)
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

    use rand::Rng;

    use crate::{
        save::{save_circuit_data, save_proof},
        withdrawal::{
            simple_withdrawal_wrapper_processor::SimpleWithdrawalWrapperProcessor,
            simple_withraw_circuit::SimpleWithdrawalValue,
        },
    };

    #[test]
    fn save_v1_withdrawl() {
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

        let processor = SimpleWithdrawalWrapperProcessor::new();
        let proof = processor.prove(&value).expect("prove failed");

        save_circuit_data(
            "../../gnark-server/data/v1_withdrawal/",
            &processor.wrapper_circuit1.data,
        )
        .expect("save failed");
        dbg!(
            serde_json::to_string(&processor.wrapper_circuit1.data.verifier_only.circuit_digest)
                .unwrap()
        );
        save_proof("../../gnark-server/data/v1_withdrawal/", &proof).expect("save failed");
    }
}
