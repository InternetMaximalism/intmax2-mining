use std::sync::RwLock;

use ::log::{error, info};
use actix_web::{web::Data, App, HttpServer};
use api::api_config;

pub mod api;
pub mod deposit_tree;
pub mod env;
pub mod external_api;
pub mod log;
pub mod processor;
pub mod prover;
pub mod utils;

lazy_static::lazy_static! {
    static ref SERVER_HOST: String = std::env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    static ref SERVER_PORT: u16 = std::env::var("SERVER_PORT").unwrap_or_else(|_| "8090".to_string()).parse::<u16>().expect(
        "SERVER_PORT must be a valid port number"
    );
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    log::init_logger();

    std::panic::set_hook(Box::new(|panic_info| {
        if let Some(location) = panic_info.location() {
            error!(
                "Panic occurred in file '{}' at line {}",
                location.file(),
                location.line()
            );
        } else {
            error!("Panic occurred but can't get location information...");
        }
        if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            error!("Panic payload: {:?}", s);
        }
    }));

    let processor = processor::Processor::new();
    let state = RwLock::new(processor);
    let app_data = Data::new(state);
    let host = SERVER_HOST.clone();
    let port = SERVER_PORT.clone();
    info!("Starting server at {host}:{port}");
    HttpServer::new(move || {
        App::new()
            .app_data(app_data.clone())
            .configure(api_config)
            .wrap(actix_web::middleware::Logger::default())
    })
    .bind((host.as_str(), port))?
    .run()
    .await
}
