import { ethers } from "hardhat";
import { getNthWallet } from "../utils/hdWallet";

async function main() {
  const wallet = ethers.Wallet.createRandom();
  const mnemonic = wallet.mnemonic;
  if (!mnemonic) {
    throw new Error("Mnemonic is not defined");
  }
  console.log("mnemonic: ", mnemonic.phrase);
  const withdrawer = getNthWallet(0, mnemonic.phrase);
  console.log("withdrawer address: ", withdrawer.address);
  console.log("withdrawer private key: ", withdrawer.privateKey);
  const deployer = ethers.Wallet.createRandom();
  console.log("deployer private key: ", deployer.privateKey);
  console.log("deployer address: ", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
