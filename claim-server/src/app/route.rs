use crate::server::{health, prover};
use actix_web::web;

pub fn setup_routes(cfg: &mut web::ServiceConfig) {
    cfg.service((health::health_check,));
    cfg.service((
        prover::claim::get_proof,
        prover::claim::get_proofs,
        prover::claim::generate_proof,
    ));
}
