import { Wallet } from "ethers";
import { appendCSV } from "../utils/csv";
import { EthHolderCsvRow } from "../types/csv";
import { ethHolderCsvPath } from "../utils/contants";
import { getNthWallet } from "../utils/hdWallet";
import { getGasPrice } from "../utils/gasPrice";

export async function sendEth(
  mnemonicStr: string,
  sender: Wallet,
  walletIndex: number,
  amount: bigint
) {
  const wallet = getNthWallet(walletIndex, mnemonicStr);

  // depoisit gas fee
  const gasPrice = await getGasPrice();
  const topUp = 2n * gasPrice * 200000n; // assume that next deposit will cost 200k gas times 2x buffer
  const value = amount + topUp;

  const tx = await sender.sendTransaction({
    to: wallet.address,
    value,
  });
  await tx.wait();
  const row = {
    walletIndex,
    address: wallet.address,
    balance: value.toString(),
    txHash: tx.hash,
  };
  await appendCSV<EthHolderCsvRow>(ethHolderCsvPath, row);
}
