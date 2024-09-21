import { cleanEnv, str } from "envalid";
import { ethers } from "hardhat";
import { IINTMAXToken__factory } from "../../typechain-types/factories/contracts/interfaces/IINTMAXToken__factory";

const env = cleanEnv(process.env, {
  INT0_MAIN_CONTRACT_ADDRESS: str(),
  INTMAX_TOKEN_ADDRESS: str(),
});

async function main() {
  const int0 = await ethers.getContractAt(
    "Int0",
    env.INT0_MAIN_CONTRACT_ADDRESS
  );
  const depositRoot = await int0.getDepositRoot();
  console.log(`Deposit root: ${depositRoot}`);

  const root =
    "0x4245f6e8400c614ade1022a91c652e9e6ac4ce0da6441ee8d360f2bed669f26e";
  const r = await int0.depositRoots(root);
  console.log(`Root: ${r}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
