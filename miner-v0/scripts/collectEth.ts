import { ethers } from "ethers";
import { getNthWallet } from "../src/utils/hdWallet";
import { getGasPrice } from "../src/utils/gasPrice";
import { getBalance } from "../src/utils/balance";
import { parse } from "ts-command-line-args";
import { IMnemonicArgs } from "../src/types/args";

interface ICollectEthArgs extends IMnemonicArgs {
  start: number;
  end: number;
}

async function main() {
  const args = parse<ICollectEthArgs>({
    mnemonic: String,
    start: Number,
    end: Number,
  });
  const withdrawer = getNthWallet(0, args.mnemonic);
  const withdrawerAddress = withdrawer.address;

  const gasPrice = await getGasPrice();
  const topUp = 2n * gasPrice * 21000n;

  for (let i = args.start; i < args.end; i++) {
    const wallet = getNthWallet(i, args.mnemonic);
    const balance = await getBalance(wallet.address);
    if (balance > ethers.parseEther("0.01")) {
      console.log(
        `Wallet ${i} address: ${wallet.address}, balance: ${balance.toString()}`
      );
      const tx = await wallet.sendTransaction({
        to: withdrawerAddress,
        value: balance - topUp,
      });
      await tx.wait();
      console.log(`Withdrawn from wallet ${i}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
