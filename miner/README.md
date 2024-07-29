# Miner

## Install dependency

```bash
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
. "$HOME/.cargo/env"

```

## Run on localnet

Edit the 4th line of `server/start.sh`, `ssh gserver -NL 8058:localhost:8058 &`, to match your ssh environment.

```bash
cd contracts
cp .env.example .env
npm i
npm run compile

cd ../server
cp .env.example .env
./start.sh

cd ../miner
cp .env.example .env
npm i
./start.sh
```

## Run on testnet/mainnet

### Deploy contract

#### Edit .env

Set `OWNER_ADDRESS` and `WITHDRAWER_ADDRESS`, which are arguments for the constructor of `Int0.sol`. In the miner script, `OWNER_ADDRESS` and `WITHDRAWER_ADDRESS` are assumed to be the same. Configure `DEPLOYER_PRIVATE_KEY` and send the deployment gas fee to the corresponding address.
Also, configure the RPC settings for the deployment network, such as `MAINNET_RPC_URL` and `SEPOLIA_RPC_URL`.

#### Deploy

Run the following command:

```bash
hardhat ignition deploy ignition/modules/Int0.ts --network sepolia
```

### Run server

#### Edit .env

You need to set the following environment variables in `server/.env`:

```bash
RPC_URL
INT0_MAIN_CONTRACT_ADDRESS
INT0_SUB_CONTRACT_ADDRESS
INT0_DEPLOYED_BLOCK_NUMBER
```

#### Run

```bash
./start.sh
```

### Run miner

#### Edit .env

You need to set the following environment variables in `miner/.env`:

```bash
RPC_URL
INT0_MAIN_CONTRACT_ADDRESS
INT0_SUB_CONTRACT_ADDRESS
MNEMONIC
```

The `MNEMONIC` is the seed phrase used to generate all wallets for mining. The address specified by `getNthWallet(0)` is called the withdrawer and needs to be funded with `numParticipants` × 1 ETH and all the gas fees required for mining. You can check the withdrawer's address by executing the following command with the MNEMONIC set:

```bash
npx ts-node src/scripts/accounts.ts
```

#### Run

```bash
rm -rf data/*
npx ts-node src/main.ts --mnemonic="Your Mnemonic" --phase=1 --walletIndex=0
```

## Rescue

If you get stuck along the way, you can run `npx ts-node src/scripts/collectEth.ts` to gather the ETH in the wallets to the withdrawer. If you cannot withdraw the funds deposited in the contract, you can run `npx ts-node src/scripts/rescue.ts` to withdraw them.
