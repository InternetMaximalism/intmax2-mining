import { ethers, upgrades } from "hardhat";
import { Int1 } from "../../typechain-types";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  DUMMY_TOKEN_CONTRACT_ADDRESS: str(),
  MINTER_V1_CONTRACT_ADDRESS: str(),
});

async function main() {
  const token = await ethers.getContractAt(
    "DummyToken",
    env.DUMMY_TOKEN_CONTRACT_ADDRESS
  );
  const tx = await token.grantRole(
    await token.MINTER_ROLE(),
    env.MINTER_V1_CONTRACT_ADDRESS
  );
  console.log(`tx hash: ${tx.hash}`);
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
