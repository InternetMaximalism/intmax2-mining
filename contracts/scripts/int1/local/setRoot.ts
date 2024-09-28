import { cleanEnv, str } from "envalid";
import { ethers } from "hardhat";

const env = cleanEnv(process.env, {
  LOCAL_MINTER_V1_CONTRACT_ADDRESS: str(),
});

async function main() {
  const minter = await ethers.getContractAt(
    "MinterV1",
    env.LOCAL_MINTER_V1_CONTRACT_ADDRESS
  );
  await minter.mint();
  await minter.setTreeRoot(
    "0xa67f377ef775f3378bde21cc02be6be0a6bb2dfee89c5ae4ecbc8501ee214964"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
