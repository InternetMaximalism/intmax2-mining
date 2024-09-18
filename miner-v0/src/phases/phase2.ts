import { Wallet } from "ethers";
import { withdrawal } from "../process/withdrawal";
import { DepositCsvRow, DepositCsvRowKeys } from "../types/csv";
import { mainDepositsCsvPath } from "../utils/contants";
import { readCSV, writeCSV } from "../utils/csv";

// withdraw from the main rollup
export async function phase2(
  mnemonicStr: string,
  withdrawer: Wallet,
  walletIndex: number
): Promise<number> {
  while (true) {
    const rows: DepositCsvRow[] = await readCSV(mainDepositsCsvPath);
    if (rows.length === 0) {
      break;
    }
    const randomIndex = Math.floor(Math.random() * rows.length);
    const row = rows[randomIndex];
    const toWalletIndex = walletIndex;
    try {
      await withdrawal(mnemonicStr, withdrawer, row, toWalletIndex, true);
    } catch (e) {
      console.error(`Failed to withdraw from main rollup (phase2), row=${row}`);
      console.error("toWalletIndex: ", toWalletIndex);
      throw e;
    }
    walletIndex += 1;
    console.log("current wallet index", walletIndex);
    rows.splice(randomIndex, 1);
    await writeCSV(mainDepositsCsvPath, rows, DepositCsvRowKeys);
  }
  return walletIndex;
}
