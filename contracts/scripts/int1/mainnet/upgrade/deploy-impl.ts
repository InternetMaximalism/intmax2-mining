import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  new Promise((resolve) => setTimeout(resolve, 20000));

  const newMinterFactory = await ethers.getContractFactory("MinterV1V3");
  const newMinter = await newMinterFactory.deploy();
  console.log(`New Minter deployed at: ${await newMinter.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
