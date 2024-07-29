use std::sync::RwLock;

use crate::processor::{Processor, WithdrawInput};
use actix_web::{
    get, post,
    web::{self, Data, Json},
    HttpResponse, Responder,
};
use log::error;

#[post("/prove-withdraw")]
pub async fn prove_withdraw(
    data: Data<RwLock<Processor>>,
    req: Json<WithdrawInput>,
) -> impl Responder {
    let res = data.write().unwrap().prove_withdraw(req.into_inner()).await;
    match res {
        Ok(withdraw_proof) => HttpResponse::Ok().json(withdraw_proof),
        Err(e) => {
            error!("prove-withdraw: {}", e.to_string());
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}

#[get("/health")]
pub async fn health() -> impl Responder {
    HttpResponse::Ok().body("OK!")
}

pub fn api_config(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/api").service(prove_withdraw).service(health));
}
