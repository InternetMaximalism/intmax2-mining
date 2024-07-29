import { getNthWallet } from "../src/utils/hdWallet";
import { getGasPrice } from "../src/utils/gasPrice";
import { getBalance } from "../src/utils/balance";
import { parse } from "ts-command-line-args";
import { IReturnEthArgs } from "../src/types/args";

async function main() {
  const args = parse<IReturnEthArgs>({
    mnemonic: String,
    to: String,
  });
  const to = args.to;
  const withdrawer = getNthWallet(0, args.mnemonic);
  // gas fee estimation
  const gasPrice = await getGasPrice();
  const balance = await getBalance(withdrawer.address);
  const topUp = 2n * gasPrice * 21000n;
  const tx = await withdrawer.sendTransaction({
    to,
    value: balance - topUp,
  });
  await tx.wait();
  console.log("Transaction hash: ", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
