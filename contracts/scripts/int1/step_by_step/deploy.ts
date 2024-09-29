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

  const int1Factory = await ethers.getContractFactory("Int1");
  const int1Implementation = await int1Factory.deploy();

  const minterFactory = await ethers.getContractFactory("MinterV1");
  const minterImplementation = await minterFactory.deploy();

  const proxyFactory = await ethers.getContractFactory("ERC1967Proxy");

  const int1 = (await proxyFactory.deploy(
    int1Implementation,
    "0x"
  )) as unknown as Contract;

  const minter = (await proxyFactory.deploy(
    minterImplementation,
    "0x"
  )) as unknown as Contract;

  // initialize
  let tx = await (int1 as any).initialize(withdrawalVerifier, admin);
  console.log(`Int1 initialized at: ${tx.hash}`);
  // initialize minter
  tx = await (minter as any).initialize(claimVerifier, token, int1, admin);
  console.log(`Minter initialized at: ${tx.hash}`);

  //   // admin roles
  //   tx = await int1
  //     .connect(admin)
  //     .grantRole(await int1.WITHDRAWER(), env.MAINNET_WITHDRAWER_ADDRESS);
  //   console.log(`Int1 WITHDRAWER role granted at: ${tx.hash}`);
  //   tx = await int1
  //     .connect(admin)
  //     .grantRole(await int1.ANALYZER(), env.MAINNET_ANALYZER_ADDRESS);
  //   console.log(`Int1 ANALYZER role granted at: ${tx.hash}`);
  //   tx = await token.connect(admin).grantRole(await token.MINTER_ROLE(), minter);
  //   console.log(`Token MINTER role granted at: ${tx.hash}`);
  //   tx = await minter
  //     .connect(admin)
  //     .grantRole(await minter.TREE_MANAGER(), env.MAINNET_TREE_MANAGER_ADDRESS);
  //   console.log(`Minter TREE_MANAGER role granted at: ${tx.hash}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
