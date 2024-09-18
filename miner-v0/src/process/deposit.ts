import { Int0__factory } from "../../typechain-types";
import { getPubkeySaltHash } from "../utils/hash";
import { getRandomPubkey, getRandomSalt } from "../utils/rand";
import { appendCSV } from "../utils/csv";
import { DepositCsvRow } from "../types/csv";
import { mainDepositsCsvPath, subDepositsCsvPath } from "../utils/contants";
import { getNthWallet } from "../utils/hdWallet";
import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
dotenv.config();

export async function deposit(
  mnemonicStr: string,
  depositorIndex: number,
  isMain: boolean,
  amount: bigint
) {
  const env = cleanEnv(process.env, {
    INT0_MAIN_CONTRACT_ADDRESS: str(),
    INT0_SUB_CONTRACT_ADDRESS: str(),
  });
  const contractAddress = isMain
    ? env.INT0_MAIN_CONTRACT_ADDRESS
    : env.INT0_SUB_CONTRACT_ADDRESS;
  const depositor = getNthWallet(depositorIndex, mnemonicStr);
  const int0 = Int0__factory.connect(contractAddress, depositor);
  const salt = getRandomSalt();
  const pubkey = getRandomPubkey();
  const pubkeySaltHash = getPubkeySaltHash(pubkey, salt);
  const leaf = {
    pubkeySaltHash,
    tokenIndex: 0,
    amount,
  };
  const tx = await int0.deposit(leaf, { value: leaf.amount });
  await tx.wait();
  const events = await int0.queryFilter(int0.filters.Deposited());
  const lastEvent = int0.interface.parseLog(events[events.length - 1]);
  if (!lastEvent) {
    throw new Error("No event found");
  }
  const { pubkeySaltHash: pubkeySaltHash_, leafIndex } = lastEvent.args;
  if (pubkeySaltHash !== pubkeySaltHash_) {
    throw new Error("Invalid pubkeySaltHash");
  }
  const depositsCsvFilePath = isMain ? mainDepositsCsvPath : subDepositsCsvPath;
  const row = {
    pubkey: pubkey.toString(),
    salt,
    pubkeySaltHash,
    leafIndex,
    depositorIndex,
    depositTxHash: tx.hash,
  };
  await appendCSV<DepositCsvRow>(depositsCsvFilePath, row);
  console.log("Deposit done: ", row);
}
