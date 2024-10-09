import { ethers, upgrades } from "hardhat";
import { Int1V2, MinterV1, MinterV1V2 } from "../../../typechain-types";

// sepolia
const int1Address = "0xF50C18ecd79475138b1f3AD786cA56Dd47122CD2";
const minterV1Address = "0xE1682013abB443D34224C996c611bD981b85F97E";

async function main() {
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Deploying contracts with the admin account: ${admin.address}`);

  const newInt1Factory = await ethers.getContractFactory("Int1V2", admin);
  const newInt1 = (await upgrades.upgradeProxy(
    int1Address,
    newInt1Factory
  )) as unknown as Int1V2;

  const newMinterV1Factory = await ethers.getContractFactory(
    "MinterV1V2",
    admin
  );
  const newMinterV1 = (await upgrades.upgradeProxy(
    minterV1Address,
    newMinterV1Factory
  )) as unknown as MinterV1V2;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
