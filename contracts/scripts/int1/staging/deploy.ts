import { ethers, upgrades } from "hardhat";
import { Int1, MinterV1 } from "../../../typechain-types";
import { cleanEnv, str } from "envalid";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";

const withdrawalVerifier = "0xd4cBc86f64cd9ff9C3a91e9DF42F850D9bA85faa";
const claimVerifier = "0x076Ffb05c6dfd8c14559a55938459C56E2411d32";
const int1 = "0x7559F5355Ab5595f9398009bF01c85F959d94F40";
const tokenAddress = "0x40FD30D54bFc29989636A25A4407d38e1e92c900";
const tree_manager = "0x757226853110BfbB8fFDa0688B35EEBFf0E28c81";

async function main() {
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  new Promise((resolve) => setTimeout(resolve, 20000));

  const minterFactory = await ethers.getContractFactory("MinterV1");
  const minter = (await upgrades.deployProxy(minterFactory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as MinterV1;
  await minter.waitForDeployment();
  console.log(`Minter deployed at: ${await minter.getAddress()}`);

  const token = await ethers.getContractAt("DummyToken", tokenAddress);

  // initialize minter
  let tx = await minter.initialize(claimVerifier, token, int1, admin);
  console.log(`Minter initialized at: ${tx.hash}`);
  tx = await token.connect(admin).grantRole(await token.MINTER_ROLE(), minter);

  console.log(`Token MINTER role granted at: ${tx.hash}`);
  tx = await minter
    .connect(admin)
    .grantRole(await minter.TREE_MANAGER(), tree_manager);
  console.log(`Minter TREE_MANAGER role granted at: ${tx.hash}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
