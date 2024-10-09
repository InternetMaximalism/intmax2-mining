import { ethers } from "hardhat";

// sepolia
const withdrawalVerifier = "0xA6594155075B608986c2ff848362A3958ACF537c";
const claimVerifier = "0x05F9546eBA37eec84c3148558471c5f58b5866Bc";

const int1Address = "0xF50C18ecd79475138b1f3AD786cA56Dd47122CD2";
const minterAddress = "0xE1682013abB443D34224C996c611bD981b85F97E";

async function main() {
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Deploying contracts with the admin account: ${admin.address}`);

  new Promise((resolve) => setTimeout(resolve, 20000));

  const int1 = await ethers.getContractAt("Int1V2", int1Address, admin);
  const tx = await int1.setVerifier(withdrawalVerifier);
  console.log(`Int1 verifier set at: ${tx.hash}`);

  const minter = await ethers.getContractAt("MinterV1V2", minterAddress, admin);
  const tx2 = await minter.setVerifier(claimVerifier);
  console.log(`Minter verifier set at: ${tx2.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
