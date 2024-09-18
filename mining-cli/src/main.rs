use cli::run;

pub mod cli;
pub mod config;
pub mod external_api;
pub mod private_data;
pub mod services;
pub mod state;
pub mod test;
pub mod utils;

#[tokio::main]
async fn main() {
    let _config = config::Settings::new().expect("Failed to load config");

    match run().await {
        Ok(_) => {}
        Err(e) => eprintln!("{:?}", e),
    }
}
