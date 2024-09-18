use std::str::FromStr;

use ethers::{
    providers::{Http, PendingTransaction},
    types::{Address, Bytes, H256, U256},
};
use intmax2_zkp::ethereum_types::u32limb_trait::U32LimbTrait;
use mining_circuit::claim::{claim_circuit::ClaimPublicInputs, mining_claim::MiningClaim};

use crate::{
    cli::status::print_status,
    external_api::contracts::minter::{get_minter_contract_with_signer, minter_v1},
};

pub async fn claim_tokens(
    claim_key: H256,
    claims: &[MiningClaim],
    pis: ClaimPublicInputs,
    proof: &str,
) -> anyhow::Result<()> {
    let minter = get_minter_contract_with_signer(claim_key);

    let mut mint_claims = Vec::<minter_v1::MintClaim>::new();
    for claim in claims {
        mint_claims.push(minter_v1::MintClaim {
            recipient: Address::from_slice(&claim.recipient.to_bytes_be()),
            nullifier: claim.nullifier.to_bytes_be().try_into().unwrap(),
            amount: U256::from_big_endian(&claim.amount.to_bytes_be()),
        });
    }
    let pis = minter_v1::ClaimPublicInputs {
        deposit_tree_root: pis.deposit_tree_root.to_bytes_be().try_into().unwrap(),
        eligible_tree_root: pis.eligible_tree_root.to_bytes_be().try_into().unwrap(),
        last_claim_hash: pis.last_claim_hash.to_bytes_be().try_into().unwrap(),
    };
    let proof = Bytes::from_str(proof).unwrap();
    let tx = minter.await?.claim_tokens(mint_claims, pis, proof);
    let pending_tx: PendingTransaction<Http> = match tx.send().await {
        Ok(tx) => tx,
        Err(e) => {
            // TODO: better error handling
            return Err(anyhow::anyhow!("Error sending transaction: {:?}", e));
        }
    };
    print_status(&format!("claim tx hash: {:?}", pending_tx.tx_hash()));
    let _tx_receipt = pending_tx.await?;
    Ok(())
}
