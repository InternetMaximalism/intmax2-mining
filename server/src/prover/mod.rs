use crate::external_api::contract::contract::PublicInputs;
use anyhow::Result;
use intmax2_zkp::{
    circuits::{
        mining::simple_withraw_circuit::{
            SimpleWithdrawCircuit, SimpleWithdrawPublicInputs, SimpleWithdrawValue,
        },
        utils::wrapper::WrapperCircuit,
    },
    common::{
        salt::Salt,
        trees::deposit_tree::{DepositLeaf, DepositMerkleProof},
    },
    ethereum_types::{address::Address, bytes32::Bytes32, u256::U256, u32limb_trait::U32LimbTrait},
    wrapper_config::plonky2_config::PoseidonBN128GoldilocksConfig,
};
use plonky2::{
    field::goldilocks_field::GoldilocksField,
    plonk::{config::PoseidonGoldilocksConfig, proof::ProofWithPublicInputs},
};

type F = GoldilocksField;
const D: usize = 2;
type C = PoseidonGoldilocksConfig;
type OuterC = PoseidonBN128GoldilocksConfig;

pub struct WithdrawProver {
    pub simple_withdraw_circuit: SimpleWithdrawCircuit<F, C, D>,
    pub wrapper_circuit1: WrapperCircuit<F, C, C, D>,
    pub wrapper_circuit2: WrapperCircuit<F, C, C, D>,
    pub wrapper_circuit3: WrapperCircuit<F, C, OuterC, D>,
}

#[derive(Debug, Clone)]
pub struct WithdrawProofWithFullPublicInputs {
    pub proof: ProofWithPublicInputs<F, OuterC, D>,
    pub public_inputs: SimpleWithdrawPublicInputs,
}

impl WithdrawProver {
    pub fn new() -> Self {
        let simple_withdraw_circuit = SimpleWithdrawCircuit::<F, C, D>::new();
        let wrapper_circuit1 = WrapperCircuit::<F, C, C, D>::new(&simple_withdraw_circuit);
        let wrapper_circuit2 = WrapperCircuit::<F, C, C, D>::new(&wrapper_circuit1);
        let wrapper_circuit3 = WrapperCircuit::<F, C, OuterC, D>::new(&wrapper_circuit2);
        Self {
            simple_withdraw_circuit,
            wrapper_circuit1,
            wrapper_circuit2,
            wrapper_circuit3,
        }
    }

    pub fn prove(
        &self,
        deposit_root: Bytes32<u32>,
        deposit_index: u32,
        deposit_leaf: DepositLeaf,
        deposit_merkle_proof: DepositMerkleProof,
        recipient: Address<u32>,
        pubkey: U256<u32>,
        salt: Salt,
    ) -> Result<WithdrawProofWithFullPublicInputs> {
        let value = SimpleWithdrawValue::new(
            deposit_root,
            deposit_index,
            deposit_leaf,
            deposit_merkle_proof,
            recipient,
            pubkey,
            salt,
        );
        let inner_proof: ProofWithPublicInputs<GoldilocksField, PoseidonGoldilocksConfig, 2> =
            self.simple_withdraw_circuit.prove(&value)?;
        let withdraw_proof1 = self.wrapper_circuit1.prove(&inner_proof)?;
        let withdraw_proof2 = self.wrapper_circuit2.prove(&withdraw_proof1)?;
        let withdraw_proof3 = self.wrapper_circuit3.prove(&withdraw_proof2)?;
        self.wrapper_circuit3
            .data
            .verify(withdraw_proof3.clone())
            .expect("verify failed");
        let pis = SimpleWithdrawPublicInputs {
            deposit_root,
            nullifier: value.nullifier,
            recipient: value.recipient,
            token_index: value.deposit_leaf.token_index,
            amount: value.deposit_leaf.amount,
        };
        Ok(WithdrawProofWithFullPublicInputs {
            proof: withdraw_proof3,
            public_inputs: pis,
        })
    }
}

impl From<SimpleWithdrawPublicInputs> for PublicInputs {
    fn from(pis: SimpleWithdrawPublicInputs) -> Self {
        PublicInputs {
            deposit_root: pis.deposit_root.to_bytes_be().try_into().unwrap(),
            nullifier: pis.nullifier.to_bytes_be().try_into().unwrap(),
            recipient: ethers::types::Address::from_slice(&pis.recipient.to_bytes_be()),
            token_index: pis.token_index,
            amount: ethers::types::U256::from_big_endian(&pis.amount.to_bytes_be()),
        }
    }
}
