import { ethers } from "hardhat";
import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const env = cleanEnv(process.env, {
    WITHDRAWER_ADDRESS: str(),
  });
  const toAddress = env.WITHDRAWER_ADDRESS;
  const signers = await ethers.getSigners();
  const signer = signers[0];
  await signer.sendTransaction({
    to: toAddress,
    value: ethers.parseEther("10"),
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
