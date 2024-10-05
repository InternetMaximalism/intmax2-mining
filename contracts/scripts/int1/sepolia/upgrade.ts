import { ethers, upgrades } from "hardhat";
import { Int1V2, MinterV1, MinterV1V2 } from "../../../typechain-types";

// holesky
const int1Address = "0x50f8A0956B1c41fA7884637ecf8322aba7e02369";
const minterV1Address = "0xDb3b66830b42dF8bB0316D783Ba4Ff5A9C212D51";

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
