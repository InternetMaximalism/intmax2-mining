import { parse } from "ts-command-line-args";
import { getNthWallet } from "../src/utils/hdWallet";
import { IMnemonicArgs } from "../src/types/args";

async function main() {
  const args = parse<IMnemonicArgs>({
    mnemonic: String,
  });

  const withdrawer = getNthWallet(0, args.mnemonic);
  console.log("Withdrawer address: ", withdrawer.address);
  console.log("Withdrawer private key: ", withdrawer.privateKey);

  for (let i = 0; i < 5; i++) {
    const wallet = getNthWallet(i + 1, args.mnemonic);
    console.log(`Wallet ${i + 1} address: ${wallet.address}`);
    console.log(`Wallet ${i + 1} private key: ${wallet.privateKey}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
