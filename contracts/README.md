# Contract

## Int1

### Test on local network

1. Launch hardhat in local network

```
npx hardhat node
```

2. Deploy the contract

```
npx hardhat run scripts/int1/deploy.ts --network localhost
```

Set `INT1_CONTRACT_ADDRESS` environment variable with the contract address.

3. Deposit test

```
npx hardhat run scripts/int1/deposit.ts --network localhost
```

4. Analyze test

```
npx hardhat run scripts/int1/analyze.ts --network localhost
```

## Int0

## Setup

- Launch hardhat in local network
- Deployment of contracts

```

./setup.sh

```
