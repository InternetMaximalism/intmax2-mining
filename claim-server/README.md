# Claim-prover

## Development

```sh
# env
cp .env.example .env

# run app
RUST_LOG=debug cargo run -r
```

## APIs

```sh
CLAIM_PROVER_URL=http://localhost:8080

# heath heck
curl $CLAIM_PROVER_URL/health | jq
```

### CLAIM_PROOF

```sh
# generate proof
curl -X POST -d '{ "challenger":"0x9Fa732B331a5455125c57f9db2E54E03c1CbbA5E", "validityProof":"'$(base64 --input data/validity_proof_2.bin)'" }' -H "Content-Type: application/json" $CLAIM_PROVER_URL/proof/claim | jq

# get proof
curl $CLAIM_PROVER_URL/proof/claim/0x6c2ff605ed2adab635279915e3a420e0df65c73df30c5902644758ebde74f2e6 | jq

# get proofs
curl "$CLAIM_PROVER_URL/proofs/claim?ids[]=0x6c2ff605ed2adab635279915e3a420e0df65c73df30c5902644758ebde74f2e6" | jq
```

## Docker

```sh
docker run -d \
  --name prover-redis \
  --hostname redis \
  --restart always \
  -p 6379:6379 \
  -v redisdata:/data \
  redis:7.2.3 \
  /bin/sh -c "redis-server --requirepass password"
```
