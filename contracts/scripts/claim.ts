import { cleanEnv, str } from "envalid";
import { ethers } from "hardhat";

const env = cleanEnv(process.env, {
  INT0_MAIN_CONTRACT_ADDRESS: str(),
});

async function main() {
  const int0 = await ethers.getContractAt(
    "Int0",
    env.INT0_MAIN_CONTRACT_ADDRESS
  );
  const depositRoot = await int0.getDepositRoot();
  console.log(`Deposit root: ${depositRoot}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
