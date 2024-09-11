import { cleanEnv, str } from "envalid";
import { ethers } from "hardhat";

const env = cleanEnv(process.env, {
  INT1_CONTRACT_ADDRESS: str(),
  ANALYZER_PRIVATE_KEY: str(),
});

async function main() {
  const int1 = await ethers.getContractAt("Int1", env.INT1_CONTRACT_ADDRESS);
  const analyzer = new ethers.Wallet(env.ANALYZER_PRIVATE_KEY, ethers.provider);
  await int1.connect(analyzer).analyzeAndProcessDeposits(3, [1]); // analyze up to depositId = 3, rejecting depositId = 1

  const lastProcessedDepositId = await int1.getLastProcessedDepositId();
  console.log(`Last processed deposit ID: ${lastProcessedDepositId}`); // should be 3
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
