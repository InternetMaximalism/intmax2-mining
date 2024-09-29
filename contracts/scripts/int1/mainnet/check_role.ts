import { ethers } from "hardhat";

async function main() {
  const int1 = await ethers.getContractAt(
    "Int1",
    "0x0Ac498bCA32B00E2584171844fb9A5943398D9c1"
  );
  const minter = await ethers.getContractAt(
    "MinterV1",
    "0x38DE07d2526Ae929f1903E5F109B70C50e12A8E0"
  );
  const withdrawerRole = await int1.WITHDRAWER();
  const analyzerRole = await int1.ANALYZER();
  const tree_managerRole = await minter.TREE_MANAGER();

  console.log(`Int1 WITHDRAWER role: ${withdrawerRole}`);
  console.log(`Int1 ANALYZER role: ${analyzerRole}`);
  console.log(`Minter TREE_MANAGER role: ${tree_managerRole}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
