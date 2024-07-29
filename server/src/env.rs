#[derive(Clone, Debug)]
pub struct EnvVars {
    pub rpc_url: String,
    pub int0_main_contract_address: String,
    pub int0_sub_contract_address: String,
    pub int0_deployed_block_number: u64,
    pub gnark_server_url: String,
}

pub fn load_env() -> EnvVars {
    dotenv::dotenv().ok();
    let rpc_url = std::env::var("RPC_URL").expect("RPC_URL must be set");
    let int0_main_contract_address = std::env::var("INT0_MAIN_CONTRACT_ADDRESS")
        .expect("INT0_MAIN_CONTRACT_ADDRESS must be set");
    let int0_sub_contract_address =
        std::env::var("INT0_SUB_CONTRACT_ADDRESS").expect("INT0_SUB_CONTRACT_ADDRESS must be set");

    let int0_deployed_block_number: u64 = std::env::var("INT0_DEPLOYED_BLOCK_NUMBER")
        .expect("INT0_DEPLOYED_BLOCK_NUMBER must be set")
        .parse()
        .expect("INT0_DEPLOYED_BLOCK_NUMBER must be a number");
    let gnark_server_url = std::env::var("GNARK_SERVER_URL").expect("GNARK_SERVER_URL must be set");
    EnvVars {
        rpc_url,
        int0_main_contract_address,
        int0_sub_contract_address,
        int0_deployed_block_number,
        gnark_server_url,
    }
}
