extern crate actix;
extern crate actix_web;
extern crate config;

use std::env;

use actix_web::{middleware, web, App, HttpServer};
use actix_web_validator::{JsonConfig, PathConfig, QueryConfig};
use app::state::AppState;

use crate::app::error_handler::handle_error;

pub mod app;
pub mod external_api;
pub mod processor;
pub mod proof;
pub mod server;

#[actix_rt::main]
async fn main() -> Result<(), std::io::Error> {
    let hostname: String = app::config::get("hostname");

    let log_level = env::var("RUST_LOG").unwrap_or("info".to_string());
    std::env::set_var("RUST_LOG", log_level);
    env_logger::init();

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let redis_url = env::var("REDIS_URL").expect("REDIS_URL must be set");
    let gnark_server_base_url = env::var("GNARK_SERVER_URL").expect("GNARK_SERVER_URL must be set");
    let listen_address = format!("{}:{}", hostname, port);

    let redis = match redis::Client::open(redis_url) {
        Ok(client) => client,
        Err(e) => {
            log::error!("Failed to create Redis client: {}", e);
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to create Redis client",
            ));
        }
    };

    let state = AppState::new(gnark_server_base_url);

    log::info!("Listening to requests at {}...", listen_address);
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(redis.clone()))
            .app_data(web::Data::new(state.clone()))
            .app_data(PathConfig::default().error_handler(handle_error))
            .app_data(QueryConfig::default().error_handler(handle_error))
            .app_data(JsonConfig::default().error_handler(handle_error))
            .configure(app::route::setup_routes)
            .wrap(middleware::Logger::default())
    })
    .bind(listen_address)?
    .run()
    .await
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
    use mining_circuit::eligible_tree::{EligibleLeaf, EligibleTree, ELIGIBLE_TREE_HEIGHT};

    use crate::app::interface::{ClaimInput, ClaimRequest};

    #[test]
    fn save_test_data() {
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
                amount: U256::from(1),
            };
            eligible_tree.push(eligible_leaf);
        }

        let claim_input0 = construct_claim_input(
            &deposit_tree,
            &eligible_tree,
            &pubkeys_and_salts,
            0,
            Address::rand(&mut rng),
        );
        let claim_input1 = construct_claim_input(
            &deposit_tree,
            &eligible_tree,
            &pubkeys_and_salts,
            1,
            Address::rand(&mut rng),
        );
        let inputs = vec![claim_input0, claim_input1];
        let claim_request = ClaimRequest {
            deposit_tree_root: deposit_tree.get_root(),
            eligible_tree_root: eligible_tree.get_root().into(),
            claims: inputs,
        };
        // save claim request to file
        let json = serde_json::to_string_pretty(&claim_request).unwrap();
        std::fs::write("data/claim_request.json", json).unwrap();
    }

    fn construct_claim_input(
        deposit_tree: &DepositTree,
        eligible_tree: &EligibleTree,
        pubkeys_and_salts: &[(U256, Salt)],
        deposit_index: u32,
        recipient: Address,
    ) -> ClaimInput {
        let (pubkey, salt) = pubkeys_and_salts[deposit_index as usize];
        let deposit_merkle_proof = deposit_tree.prove(deposit_index as usize);
        let deposit = deposit_tree.get_leaf(deposit_index as usize);
        let eligible_index = deposit_index; // for now
        let eligible_merkle_proof = eligible_tree.prove(eligible_index as usize);
        let eligible_leaf = eligible_tree.get_leaf(eligible_index as usize);
        assert_eq!(eligible_leaf.deposit_index, deposit_index);
        ClaimInput {
            deposit_index,
            deposit_merkle_proof,
            deposit,
            eligible_index,
            eligible_merkle_proof,
            eligible_leaf,
            pubkey,
            salt,
            recipient,
        }
    }
}
