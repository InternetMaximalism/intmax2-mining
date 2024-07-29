import { Wallet } from "ethers";
import { withdrawal } from "../process/withdrawal";
import { DepositCsvRow, DepositCsvRowKeys } from "../types/csv";
import { subDepositsCsvPath } from "../utils/contants";
import { readCSV, writeCSV } from "../utils/csv";

// withdraw from the sub rollup
export async function phase4(
  mnemonicStr: string,
  withdrawer: Wallet,
  walletIndex: number
): Promise<number> {
  while (true) {
    const rows: DepositCsvRow[] = await readCSV(subDepositsCsvPath);
    if (rows.length === 0) {
      break;
    }
    const randomIndex = Math.floor(Math.random() * rows.length);
    const row = rows[randomIndex];
    const toWalletIndex = walletIndex;
    try {
      await withdrawal(mnemonicStr, withdrawer, row, toWalletIndex, false);
    } catch (e) {
      console.error(`Failed to withdraw from sub rollup (phase4), row=${row}`);
      console.error("toWalletIndex: ", toWalletIndex);
      throw e;
    }
    walletIndex += 1;
    console.log("current wallet index", walletIndex);
    rows.splice(randomIndex, 1);
    await writeCSV(subDepositsCsvPath, rows, DepositCsvRowKeys);
  }
  return walletIndex;
}
