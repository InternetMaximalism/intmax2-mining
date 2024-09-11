import { ethers, ignition } from "hardhat";
import Int0Module from "../../ignition/modules/Int0";
import { getPubkeySaltHash } from "../../utils/hash";
import { appendCSV, depositsCsvFilePath } from "../../utils/csv";
import { getRandomPubkey, getRandomSalt } from "../../utils/rand";
import { DepositCsvRow } from "../../types/csv";

async function main() {
  const isMain = false;
  const { int0_main, int0_sub } = await ignition.deploy(Int0Module);
  const int0 = isMain ? int0_main : int0_sub;
  const salt = getRandomSalt();
  const pubkey = getRandomPubkey();
  const pubkeySaltHash = getPubkeySaltHash(pubkey, salt);
  const leaf = {
    pubkeySaltHash,
    tokenIndex: 0,
    amount: ethers.parseEther("1"),
  };
  console.log("pubkey", pubkey);
  console.log("salt", salt);
  console.log("pubkeySaltHash", pubkeySaltHash);
  const tx = await int0.deposit(leaf, { value: leaf.amount });
  const receipt = await tx.wait();
  console.log("gas used", receipt.gasUsed);

  const events = await int0.queryFilter(int0.filters.Deposited());
  const lastEvent = int0.interface.parseLog(events[events.length - 1]);
  if (!lastEvent) {
    throw new Error("No event found");
  }
  const { pubkeySaltHash: pubkeySaltHash_, leafIndex } = lastEvent.args;
  if (pubkeySaltHash !== pubkeySaltHash_) {
    throw new Error("Invalid pubkeySaltHash");
  }
  console.log("leaf index", leafIndex);
  const signer = await ethers.getSigners();
  await appendCSV<DepositCsvRow>(depositsCsvFilePath, {
    pubkey: pubkey.toString(),
    salt,
    pubkeySaltHash,
    leafIndex,
    depositor: await signer[0].getAddress(),
    depositedAt: new Date().toISOString(),
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
