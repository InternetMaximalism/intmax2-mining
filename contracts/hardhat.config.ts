import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-verify";
import { cleanEnv, str, url } from "envalid";
import dotenv from "dotenv";
dotenv.config();

const env = cleanEnv(process.env, {
  // MAINNET_DEPLOYER_PRIVATE_KEY: str(),
  // MAINNET_ADMIN_PRIVATE_KEY: str(),
  TESTNET_DEPLOYER_PRIVATE_KEY: str(),
  TESTNET_ADMIN_PRIVATE_KEY: str(),
  SEPOLIA_RPC_URL: url(),
  MAINNET_RPC_URL: url(),
  HOLESKY_RPC_URL: url(),
  BASESEP_RPC_URL: url(),
  ETHERSCAN_API_KEY: str(),
});

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: env.SEPOLIA_RPC_URL,
      accounts: [
        env.TESTNET_DEPLOYER_PRIVATE_KEY,
        env.TESTNET_ADMIN_PRIVATE_KEY,
      ],
    },
    holesky: {
      url: env.HOLESKY_RPC_URL,
      accounts: [
        env.TESTNET_DEPLOYER_PRIVATE_KEY,
        env.TESTNET_ADMIN_PRIVATE_KEY,
      ],
    },
    "base-sepolia": {
      url: env.BASESEP_RPC_URL,
      accounts: [
        env.TESTNET_DEPLOYER_PRIVATE_KEY,
        env.TESTNET_ADMIN_PRIVATE_KEY,
      ],
    },
    mainnet: {
      url: env.MAINNET_RPC_URL,
      accounts: [
        // env.MAINNET_DEPLOYER_PRIVATE_KEY,
        // env.MAINNET_ADMIN_PRIVATE_KEY,
      ],
    },
  },
  etherscan: {
    apiKey: env.ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
