import { cleanEnv, str } from "envalid";
import { ethers } from "hardhat";
import { IINTMAXToken__factory } from "../typechain-types/factories/contracts/interfaces/IINTMAXToken__factory";

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
  const token = IINTMAXToken__factory.connect(
    env.INTMAX_TOKEN_ADDRESS,
    ethers.provider
  );
  const mintable = await token.totalMintableAmount();
  console.log(`Mintable amount: ${ethers.formatEther(mintable)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
