#[derive(Clone, Debug)]
pub struct EnvVars {
    pub gnark_server_url: String,
}

pub fn load_env() -> EnvVars {
    dotenv::dotenv().ok();
    let gnark_server_url = std::env::var("GNARK_SERVER_URL").expect("GNARK_SERVER_URL must be set");
    EnvVars { gnark_server_url }
}
