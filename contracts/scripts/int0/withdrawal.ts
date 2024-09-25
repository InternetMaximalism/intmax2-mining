import {
  appendCSV,
  depositsCsvFilePath,
  readCSV,
  withdrawalsCsvFilePath,
  writeCSV,
} from "../../utils/csv";
import { WithdrawInput, requestProve } from "../../api/prover";
import { addHexPrefix } from "../../utils/conversion";
import Int0Module from "../../ignition/modules/int0/Int0";
import { ethers, ignition } from "hardhat";
import { Int0 } from "../../typechain-types";
import { DepositCsvRow, WithdrawalCsvRow } from "../../types/csv";

async function main() {
  const isMain = false;
  const { int0_main, int0_sub } = await ignition.deploy(Int0Module);
  const int0 = (isMain ? int0_main : int0_sub) as unknown as Int0;

  const rows: DepositCsvRow[] = await readCSV(depositsCsvFilePath);
  const randomIndex = Math.floor(Math.random() * rows.length);
  const row = rows[randomIndex];
  const to = ethers.Wallet.createRandom().address;
  const request: WithdrawInput = {
    isMain,
    depositIndex: parseInt(row.leafIndex),
    recipient: to,
    pubkey: row.pubkey,
    salt: row.salt,
  };
  console.log("Withdrawal request: ", request);
  const res = await requestProve(request);
  console.log("proof done");
  await int0.withdraw(
    {
      depositRoot: addHexPrefix(res.publicInputs.depositRoot),
      nullifier: addHexPrefix(res.publicInputs.nullifier),
      recipient: to,
      tokenIndex: res.publicInputs.tokenIndex,
      amount: res.publicInputs.amount,
    },
    addHexPrefix(res.proof)
  );
  const signer = await ethers.getSigners();
  const withdrawalRow = {
    ...row,
    withdrawer: await signer[0].getAddress(),
    withdrawnAt: new Date().toISOString(),
  };
  console.log("Withdrawal done: ", withdrawalRow);

  // delete deposit row
  rows.splice(randomIndex, 1);
  await writeCSV(depositsCsvFilePath, rows);
  await appendCSV<WithdrawalCsvRow>(withdrawalsCsvFilePath, withdrawalRow);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
