import { ethers, upgrades } from "hardhat";
import { Int1, MinterV1 } from "../../../typechain-types";
import { cleanEnv, str } from "envalid";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";

const withdrawalVerifier = "0xd4cBc86f64cd9ff9C3a91e9DF42F850D9bA85faa";
const claimVerifier = "0x076Ffb05c6dfd8c14559a55938459C56E2411d32";

const withdrawer = "0x90fa6B9B1eE34b48aD1088aA78efF4274bb0Bab7";
const tree_manager = "0x9c843A9a65B85423Fd9F2A674C2AC186809E377A";
const analyzer = "0x7330DFEB19b875c6b8851bDe6a57442125B23232";
const admin = "0xcCa94A453f4f69a6dFdC83aD8D8dc94fE9B75cC2";
const token = "0xe24e207c6156241cAfb41D025B3b5F0677114C81";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  new Promise((resolve) => setTimeout(resolve, 20000));

  const int1Factory = await ethers.getContractFactory("Int1");
  const int1 = (await upgrades.deployProxy(int1Factory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as Int1;
  await int1.waitForDeployment();
  console.log(`Int1 deployed at: ${await int1.getAddress()}`);

  const minterFactory = await ethers.getContractFactory("MinterV1");
  const minter = (await upgrades.deployProxy(minterFactory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as MinterV1;
  await minter.waitForDeployment();
  console.log(`Minter deployed at: ${await minter.getAddress()}`);

  // initialize
  let tx = await int1.initialize(withdrawalVerifier, admin);
  console.log(`Int1 initialized at: ${tx.hash}`);
  // initialize minter
  tx = await minter.initialize(claimVerifier, token, int1, admin);
  console.log(`Minter initialized at: ${tx.hash}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
