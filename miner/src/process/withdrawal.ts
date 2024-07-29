import { appendCSV } from "../utils/csv";
import { WithdrawInput, requestProve } from "../api/prover";
import { addHexPrefix, removeHexPrefix } from "../utils/conversion";
import { DepositCsvRow, WithdrawalCsvRow } from "../types/csv";
import {
  ethHolderCsvPath,
  mainWithdrawalsCsvPath,
  subWithdrawalsCsvPath,
} from "../utils/contants";
import { Int0__factory } from "../../typechain-types";
import { Wallet } from "ethers";
import { getNthWallet } from "../utils/hdWallet";
import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
import { getGasPrice } from "../utils/gasPrice";
import { getBalance } from "../utils/balance";
dotenv.config();

export async function withdrawal(
  mnemonicStr: string,
  withdrawer: Wallet,
  depositRow: DepositCsvRow,
  toWalletIndex: number,
  isMain: boolean
) {
  const toWallet = getNthWallet(toWalletIndex, mnemonicStr);
  const request: WithdrawInput = {
    isMain,
    depositIndex: parseInt(depositRow.leafIndex),
    recipient: removeHexPrefix(toWallet.address),
    pubkey: depositRow.pubkey,
    salt: removeHexPrefix(depositRow.salt),
  };
  const res = await requestProve(request);
  console.log("Proof generated");
  const env = cleanEnv(process.env, {
    INT0_MAIN_CONTRACT_ADDRESS: str(),
    INT0_SUB_CONTRACT_ADDRESS: str(),
  });
  const contractAddress = isMain
    ? env.INT0_MAIN_CONTRACT_ADDRESS
    : env.INT0_SUB_CONTRACT_ADDRESS;
  const int0 = Int0__factory.connect(contractAddress, withdrawer);

  // depoisit gas fee
  const gasPrice = await getGasPrice();
  const topUp = 2n * gasPrice * 200000n; // assume that next deposit will cost 200k gas times 2x buffer

  const tx = await int0.withdraw(
    {
      depositRoot: addHexPrefix(res.publicInputs.depositRoot),
      nullifier: addHexPrefix(res.publicInputs.nullifier),
      recipient: toWallet.address,
      tokenIndex: res.publicInputs.tokenIndex,
      amount: res.publicInputs.amount,
    },
    addHexPrefix(res.proof),
    { value: topUp }
  );
  await tx.wait();
  const withdrawalRow = {
    ...depositRow,
    toWalletIndex,
    withdrawalTxHash: tx.hash,
  };
  const withdrawalsCsvFilePath = isMain
    ? mainWithdrawalsCsvPath
    : subWithdrawalsCsvPath;
  await appendCSV<WithdrawalCsvRow>(withdrawalsCsvFilePath, withdrawalRow);
  const balance = await getBalance(toWallet.address);
  // append eth holder
  const ethHolderRow = {
    walletIndex: toWalletIndex,
    address: toWallet.address,
    balance: balance,
    txHash: tx.hash,
  };
  await appendCSV(ethHolderCsvPath, ethHolderRow);
  console.log("Withdrawal done: ", withdrawalRow);
}
