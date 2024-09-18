import { ethers, upgrades } from "hardhat";
import { Int1 } from "../../typechain-types";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  ANALYZER_ADDRESS: str(),
  INT1_CONTRACT_ADDRESS: str(),
});

async function main() {
  const int1 = await ethers.getContractAt("Int1", env.INT1_CONTRACT_ADDRESS);
  const withdrawalVerifier = "0x5fa26795fe48611a93474aa82fbdbd2a13d38406";
  const tx = await int1.initialize(withdrawalVerifier, env.ANALYZER_ADDRESS);
  console.log(`tx hash: ${tx.hash}`);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
