use anyhow::Result;
use intmax2_zkp::{
    ethereum_types::{bytes32::Bytes32, u32limb_trait::U32LimbTrait as _},
    utils::conversion::ToU64,
};
use plonky2::{
    field::extension::Extendable,
    hash::hash_types::RichField,
    plonk::{
        config::{AlgebraicHasher, GenericConfig},
        proof::ProofWithPublicInputs,
    },
};

use crate::claim::claim_circuit::{ClaimPublicInputs, CLAIM_PUBLIC_INPUTS_LEN};

use super::{
    claim_circuit::ClaimCircuit,
    claim_inner_circuit::{ClaimInnerCircuit, ClaimInnerValue},
};

pub struct ClaimProcessor<F, C, const D: usize>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
{
    pub claim_inner_circuit: ClaimInnerCircuit<F, C, D>,
    pub claim_circuit: ClaimCircuit<F, C, D>,
}

impl<F, C, const D: usize> ClaimProcessor<F, C, D>
where
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F> + 'static,
    <C as GenericConfig<D>>::Hasher: AlgebraicHasher<F>,
{
    pub fn new() -> Self {
        let claim_inner_circuit = ClaimInnerCircuit::new();
        let claim_circuit = ClaimCircuit::new(&claim_inner_circuit);
        Self {
            claim_inner_circuit,
            claim_circuit,
        }
    }

    pub fn prove(
        &self,
        claim_value: &ClaimInnerValue,
        prev_claim_proof: &Option<ProofWithPublicInputs<F, C, D>>,
    ) -> Result<ProofWithPublicInputs<F, C, D>> {
        let prev_claim_hash = if prev_claim_proof.is_some() {
            let prev_pis = ClaimPublicInputs::from_u64_slice(
                &prev_claim_proof.as_ref().unwrap().public_inputs[0..CLAIM_PUBLIC_INPUTS_LEN]
                    .to_u64_vec(),
            );
            prev_pis.last_claim_hash
        } else {
            Bytes32::zero()
        };
        assert_eq!(prev_claim_hash, claim_value.prev_claim_hash);
        let claim_inner_proof = self.claim_inner_circuit.prove(claim_value)?;
        let claim_proof = self
            .claim_circuit
            .prove(&claim_inner_proof, prev_claim_proof)?;
        Ok(claim_proof)
    }
}

#[cfg(test)]
mod tests {
    use crate::{
        claim::{claim_inner_circuit::ClaimInnerValue, claim_processor::ClaimProcessor},
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

    #[test]
    fn test_claim_processor() {
        const D: usize = 2;
        type C = PoseidonGoldilocksConfig;
        type F = <C as GenericConfig<D>>::F;

        let mut rng = rand::thread_rng();
        let n = 5; // number of deposits

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
                amount: 1,
            };
            eligible_tree.push(eligible_leaf);
        }

        // claim chain
        let claim_value0 = construct_claim_value(
            &deposit_tree,
            &eligible_tree,
            &pubkeys_and_salts,
            0,
            Address::rand(&mut rng),
            Bytes32::zero(),
        );
        let claim_value1 = construct_claim_value(
            &deposit_tree,
            &eligible_tree,
            &pubkeys_and_salts,
            1,
            Address::rand(&mut rng),
            claim_value0.new_claim_hash,
        );

        let claim_processor = ClaimProcessor::<F, C, D>::new();

        let claim_proof0 = claim_processor.prove(&claim_value0, &None).unwrap();
        let _claim_proof1 = claim_processor
            .prove(&claim_value1, &Some(claim_proof0))
            .unwrap();
    }

    fn construct_claim_value(
        deposit_tree: &DepositTree,
        eligible_tree: &EligibleTree,
        pubkeys_and_salts: &[(U256, Salt)],
        deposit_index: u32,
        recipient: Address,
        prev_claim_hash: Bytes32,
    ) -> ClaimInnerValue {
        let (pubkey, salt) = pubkeys_and_salts[deposit_index as usize];
        let deposit_merkle_proof = deposit_tree.prove(deposit_index as usize);
        let deposit = deposit_tree.get_leaf(deposit_index as usize);
        let eligible_index = deposit_index; // for now
        let eligible_merkle_proof = eligible_tree.prove(eligible_index as usize);
        let eligible_leaf = eligible_tree.get_leaf(eligible_index as usize);
        assert_eq!(eligible_leaf.deposit_index, deposit_index);

        let deposit_tree_root = deposit_tree.get_root();
        let eligible_tree_root = eligible_tree.get_root();
        ClaimInnerValue::new(
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
    }
}
