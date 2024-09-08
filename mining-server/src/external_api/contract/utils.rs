use std::sync::Arc;

use anyhow::{Ok, Result};
use ethers::providers::{Http, Provider};

pub async fn get_client() -> Result<Arc<Provider<Http>>> {
    let env_vars = crate::env::load_env();
    let provider = Provider::<Http>::try_from(env_vars.rpc_url)?;
    let client = Arc::new(provider);
    Ok(client)
}
