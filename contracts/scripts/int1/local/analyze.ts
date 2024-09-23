import { cleanEnv, str } from "envalid";
import { ethers } from "hardhat";

const env = cleanEnv(process.env, {
  LOCAL_INT1_CONTRACT_ADDRESS: str(),
  ANALYZER_PRIVATE_KEY: str(),
});

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("signer address:", signer.address);

  const int1 = await ethers.getContractAt(
    "Int1",
    env.LOCAL_INT1_CONTRACT_ADDRESS
  );
  const analyzer = signer;
  const lastDepositId = await int1.getLastDepositId();
  console.log(`Last deposit ID: ${lastDepositId}`);
  await int1.connect(analyzer).analyzeAndProcessDeposits(lastDepositId, []);
  const lastProcessedDepositId = await int1.getLastProcessedDepositId();
  console.log(`Last processed deposit ID: ${lastProcessedDepositId}`); // should be 3
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
