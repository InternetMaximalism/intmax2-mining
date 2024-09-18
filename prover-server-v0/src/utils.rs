use std::{fs::File, io::BufReader};

use anyhow::Result;
use intmax2_zkp::wrapper_config::plonky2_config::PoseidonBN128GoldilocksConfig;
use plonky2::{field::goldilocks_field::GoldilocksField, plonk::proof::ProofWithPublicInputs};

type F = GoldilocksField;
const D: usize = 2;
type OuterC = PoseidonBN128GoldilocksConfig;

pub fn read_proof(path: &str) -> Result<ProofWithPublicInputs<F, OuterC, D>> {
    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let proof = serde_json::from_reader(reader)?;
    Ok(proof)
}
