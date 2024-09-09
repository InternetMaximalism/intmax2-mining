use crate::{
    app::{
        interface::{
            ClaimIdQuery, ClaimOutput, ClaimRequest, GenerateProofResponse, ProofResponse,
            ProofsResponse, SingleResult,
        },
        state::AppState,
    },
    proof::generate_claim_proof_job,
};
use actix_web::{error, get, post, web, HttpRequest, HttpResponse, Responder, Result};
use redis::AsyncCommands;

#[get("/proof/claim/{id}")]
async fn get_proof(
    id: web::Path<String>,
    redis: web::Data<redis::Client>,
) -> Result<impl Responder> {
    let mut conn = redis
        .get_async_connection()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let request_id = get_claim_request_id(&id);
    let result_str: String = conn
        .get(&request_id)
        .await
        .map_err(error::ErrorInternalServerError)?;
    let result: Option<ClaimOutput> = serde_json::from_str(&result_str).map_err(|e| {
        log::warn!("Failed to deserialize proof: {:?}", e);
        error::ErrorInternalServerError("Failed to deserialize result")
    })?;
    let response = ProofResponse {
        success: true,
        result,
    };
    Ok(HttpResponse::Ok().json(response))
}

#[get("/proofs/claim")]
async fn get_proofs(req: HttpRequest, redis: web::Data<redis::Client>) -> Result<impl Responder> {
    let mut conn = redis
        .get_async_connection()
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let query_string = req.query_string();
    let ids_query: Result<ClaimIdQuery, _> = serde_qs::from_str(query_string);
    let ids: Vec<String>;

    match ids_query {
        Ok(query) => {
            ids = query.ids;
        }
        Err(e) => {
            log::warn!("Failed to deserialize query: {:?}", e);
            return Ok(HttpResponse::BadRequest().body("Invalid query parameters"));
        }
    }

    let mut results: Vec<SingleResult> = Vec::new();
    for id in &ids {
        let request_id = get_claim_request_id(&id);
        let result_str: String = conn
            .get(&request_id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
        let optional_result: Option<ClaimOutput> =
            serde_json::from_str(&result_str).map_err(|e| {
                log::warn!("Failed to deserialize proof: {:?}", e);
                error::ErrorInternalServerError("Failed to deserialize result")
            })?;

        if let Some(result) = optional_result {
            results.push(SingleResult {
                id: id.clone(),
                result,
            });
        }
    }
    let response = ProofsResponse {
        success: true,
        results,
    };
    Ok(HttpResponse::Ok().json(response))
}

#[post("/proof/claim")]
async fn generate_proof(
    req: web::Json<ClaimRequest>,
    redis: web::Data<redis::Client>,
    state: web::Data<AppState>,
) -> Result<impl Responder> {
    let mut redis_conn = redis
        .get_async_connection()
        .await
        .map_err(error::ErrorInternalServerError)?;

    let req: ClaimRequest = req.into_inner();

    // validation
    let (values, last_claim_hash) = state
        .processor
        .get()
        .ok_or_else(|| {
            log::warn!("Processor is not built");
            error::ErrorInternalServerError("Processor is not built")
        })?
        .validate_and_create_witnesses(&req)
        .map_err(|e| {
            log::warn!("Failed to validate and create witnesses: {:?}", e);
            error::ErrorBadRequest(format!("Invalid claim request: {:?}", e))
        })?;

    let request_id = get_claim_request_id(&last_claim_hash.to_string());

    let old_proof = redis::Cmd::get(&request_id)
        .query_async::<_, Option<String>>(&mut redis_conn)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    if old_proof.is_some() {
        let response = ProofResponse {
            success: true,
            result: None,
        };
        return Ok(HttpResponse::Ok().json(response));
    }

    // Spawn a new task to generate the proof
    actix_web::rt::spawn(async move {
        let response = generate_claim_proof_job(
            request_id,
            &values,
            state
                .processor
                .get()
                .expect("claim circuit is not initialized"),
            &mut redis_conn,
        )
        .await;

        match response {
            Ok(v) => {
                log::info!("Proof generation completed");
                Ok(v)
            }
            Err(e) => {
                log::error!("Failed to generate proof: {:?}", e);
                Err(e)
            }
        }
    });

    Ok(HttpResponse::Ok().json(GenerateProofResponse {
        success: true,
        message: format!(
            "claim proof (last_claim_hash: {}) is generating",
            last_claim_hash.to_string()
        ),
        last_claim_hash,
        error_message: None,
    }))
}

fn get_claim_request_id(last_claim_hash: &str) -> String {
    format!("claim/{}", last_claim_hash)
}
