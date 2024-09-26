import { ethers, upgrades } from "hardhat";
import { DummyToken, Int1, MinterV1 } from "../../typechain-types";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  WITHDRAWER_ADDRESS: str(),
  ANALYZER_ADDRESS: str(),
  TREE_MANAGER_ADDRESS: str(),
});

async function main() {
  console.log(env);
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Deploying contracts with the admin account: ${admin.address}`);

  // sleep 20 secs to confirm the deployment
  await new Promise((resolve) => setTimeout(resolve, 20000));

  const claimVerifierFactory = await ethers.getContractFactory(
    "ClaimPlonkVerifier"
  );
  const claimVerifier = await claimVerifierFactory.deploy();
  console.log(
    `Claim verifier deployed at: ${await claimVerifier.getAddress()}`
  );
  const minterFactory = await ethers.getContractFactory("MinterV1");
  const minter = (await upgrades.deployProxy(minterFactory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as MinterV1;
  await minter.waitForDeployment();
  console.log(`Minter deployed at: ${await minter.getAddress()}`);

  // actual values
  const int1 = (await ethers.getContractAt(
    "Int1",
    "0x7559F5355Ab5595f9398009bF01c85F959d94F40"
  )) as Int1;
  const withdrawalVerifier = "0xd4cBc86f64cd9ff9C3a91e9DF42F850D9bA85faa";
  const token = (await ethers.getContractAt(
    "DummyToken",
    "0x40FD30D54bFc29989636A25A4407d38e1e92c900"
  )) as DummyToken;

  // initialize
  let tx = await int1.initialize(withdrawalVerifier, admin);
  console.log(`Int1 initialized at: ${tx.hash}`);

  tx = await minter.initialize(claimVerifier, token, int1, admin);
  console.log(`Minter initialized at: ${tx.hash}`);

  // admin roles
  tx = await int1
    .connect(admin)
    .grantRole(await int1.WITHDRAWER(), env.WITHDRAWER_ADDRESS);
  console.log(`Int1 WITHDRAWER role granted at: ${tx.hash}`);
  tx = await int1
    .connect(admin)
    .grantRole(await int1.ANALYZER(), env.ANALYZER_ADDRESS);
  console.log(`Int1 ANALYZER role granted at: ${tx.hash}`);
  tx = await token.connect(admin).grantRole(await token.MINTER_ROLE(), minter);
  console.log(`Token MINTER role granted at: ${tx.hash}`);
  tx = await minter
    .connect(admin)
    .grantRole(await minter.TREE_MANAGER(), env.TREE_MANAGER_ADDRESS);
  console.log(`Minter TREE_MANAGER role granted at: ${tx.hash}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
