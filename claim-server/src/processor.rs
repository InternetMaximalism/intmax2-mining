use mining_circuit::claim::{
    claim_processor::ClaimProcessor, claim_wrapper_processor::ClaimWrapperProcessor,
};
use plonky2::{field::goldilocks_field::GoldilocksField, plonk::config::PoseidonGoldilocksConfig};

use crate::{external_api::gnark_server::GnarkServer, io::ClaimInput};

type F = GoldilocksField;
type C = PoseidonGoldilocksConfig;
const D: usize = 2;

pub struct Processor {
    claim_processor: ClaimProcessor<F, C, D>,
    wrapper_processor: ClaimWrapperProcessor,
    gnark_server: GnarkServer,
}

impl Processor {
    pub fn new() -> Self {
        let claim_processor = ClaimProcessor::new();
        let wrapper_processor = ClaimWrapperProcessor::new(&claim_processor.claim_circuit);
        let gnark_server = GnarkServer::new();
        Self {
            claim_processor,
            wrapper_processor,
            gnark_server,
        }
    }

    pub fn prove_claims(&self, claims: &[ClaimInput]) {}
}
