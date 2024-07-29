import { ethers } from "ethers";
import { getNthWallet } from "../utils/hdWallet";
import minimist from "minimist";

async function main() {
  const args = minimist(process.argv.slice(2), {
    string: ["mnemonic"],
  });
  if (!args.mnemonic) {
    throw new Error("Mnemonic is not defined");
  }
  const mnemonic = ethers.Mnemonic.fromPhrase(args.mnemonic);
  console.log("mnemonic: ", mnemonic.phrase);
  const withdrawer = getNthWallet(0, mnemonic.phrase);
  console.log("withdrawer address: ", withdrawer.address);
  console.log("withdrawer private key: ", withdrawer.privateKey);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
