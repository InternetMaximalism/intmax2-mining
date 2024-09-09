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
curl -X POST -H "Content-Type: application/json" -d @data/claim_request.json $CLAIM_PROVER_URL/proof/claim | jq

# get proof
curl $CLAIM_PROVER_URL/proof/claim/0x840a9930fd8d9641675e8d9bf7e7cf475b3821dc35f56f64a75d633ec91a56dc | jq

# get proofs
curl "$CLAIM_PROVER_URL/proofs/claim?ids[]=0x840a9930fd8d9641675e8d9bf7e7cf475b3821dc35f56f64a75d633ec91a56dc" | jq
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
