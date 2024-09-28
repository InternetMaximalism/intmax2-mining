import { ethers, upgrades } from "hardhat";
import { cleanEnv, str } from "envalid";
import { MinterV1 } from "../../../typechain-types";

const env = cleanEnv(process.env, {
  SEPOLIA_WITHDRAWER_ADDRESS: str(),
  SEPOLIA_ANALYZER_ADDRESS: str(),
  SEPOLIA_TREE_MANAGER_ADDRESS: str(),
});

// constant
const claimVerifier = "0xF50C18ecd79475138b1f3AD786cA56Dd47122CD2";

async function main() {
  console.log(env);
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Deploying contracts with the admin account: ${admin.address}`);

  // sleep 20 secs to confirm the deployment
  await new Promise((resolve) => setTimeout(resolve, 20000));

  // get the deployed contracts
  const int1 = await ethers.getContractAt(
    "Int1",
    "0x50f8A0956B1c41fA7884637ecf8322aba7e02369"
  );
  const token = await ethers.getContractAt(
    "DummyToken",
    "0x78801e4e578860bbcd72A7c79aA363D762d52351"
  );

  const minterFactory = await ethers.getContractFactory("MinterV1");
  const minter = (await upgrades.deployProxy(minterFactory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as MinterV1;
  await minter.waitForDeployment();
  console.log(`Minter deployed at: ${await minter.getAddress()}`);

  let tx = await minter.initialize(claimVerifier, token, int1, admin);
  console.log(`Minter initialized at: ${tx.hash}`);

  // sleep 20 secs to confirm the deployment
  tx = await token.connect(admin).grantRole(await token.MINTER_ROLE(), minter);
  console.log(`Token MINTER role granted at: ${tx.hash}`);
  tx = await minter
    .connect(admin)
    .grantRole(await minter.TREE_MANAGER(), env.SEPOLIA_TREE_MANAGER_ADDRESS);
  console.log(`Minter TREE_MANAGER role granted at: ${tx.hash}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
