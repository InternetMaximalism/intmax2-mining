import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-verify";
import { cleanEnv, str, url } from "envalid";
import dotenv from "dotenv";
dotenv.config();

const env = cleanEnv(process.env, {
  DEPLOYER_PRIVATE_KEY: str(),
  DEPLOYER_ADDRESS: str(),
  SEPOLIA_RPC_URL: url(),
  MAINNET_RPC_URL: url(),
  ETHERSCAN_API_KEY: str(),
});

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: env.SEPOLIA_RPC_URL,
      accounts: [env.DEPLOYER_PRIVATE_KEY],
    },
    mainnet: {
      url: env.MAINNET_RPC_URL,
      accounts: [env.DEPLOYER_PRIVATE_KEY],
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
