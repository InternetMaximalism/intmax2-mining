import { deposit } from "../process/deposit";
import { EthHolderCsvRow, EthHolderCsvRowKeys } from "../types/csv";
import { ethHolderCsvPath } from "../utils/contants";
import { readCSV, writeCSV } from "../utils/csv";

// deposit to sub rollup
export async function phase3(
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
      await deposit(mnemonicStr, row.walletIndex, false, depositAmount);
    } catch (e) {
      console.error(`Failed to deposit to sub rollup (phase3), row=${row}`);
      throw e;
    }
    rows.splice(randomIndex, 1);
    await writeCSV(ethHolderCsvPath, rows, EthHolderCsvRowKeys);
  }
}
