import { deposit } from "../process/deposit";
import { EthHolderCsvRow, EthHolderCsvRowKeys } from "../types/csv";
import { ethHolderCsvPath } from "../utils/contants";
import { readCSV, writeCSV } from "../utils/csv";

// deposit to main rollup
export async function phase1(
  mnemonicStr: string,
  depositAmount: bigint
): Promise<void> {
  while (true) {
    const rows: EthHolderCsvRow[] = await readCSV(ethHolderCsvPath);
    if (rows.length === 0) {
      break;
    }
    const randomIndex = Math.floor(Math.random() * rows.length);
    const row = rows[randomIndex];
    try {
      await deposit(mnemonicStr, row.walletIndex, true, depositAmount);
    } catch (e) {
      console.error(`Failed to deposit to main rollup (phase1), row=${row}`);
      throw e;
    }
    rows.splice(randomIndex, 1);
    await writeCSV(ethHolderCsvPath, rows, EthHolderCsvRowKeys);
  }
}
