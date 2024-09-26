import { ethers, upgrades } from "hardhat";
import { Int1, MinterV1 } from "../../../typechain-types";

async function main() {
  const [admin] = await ethers.getSigners();
  const treeManager = admin;
  const withdrawer = admin;
  const analyzer = admin;
  console.log(`Deploying contracts with the account: ${admin.address}`);

  const withdrawalVerifierFactory = await ethers.getContractFactory(
    "V1WithdrawalPlonkVerifier"
  );
  const withdrawalVerifier = await withdrawalVerifierFactory.deploy();
  console.log(
    `Withdrawal verifier deployed at: ${await withdrawalVerifier.getAddress()}`
  );

  const int1Factory = await ethers.getContractFactory("Int1");
  const int1 = (await upgrades.deployProxy(int1Factory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as Int1;
  await int1.waitForDeployment();
  console.log(`Int1 deployed at: ${await int1.getAddress()}`);

  // initialize
  await int1.initialize(await withdrawalVerifier.getAddress(), admin);
  await int1.grantRole(await int1.WITHDRAWER(), withdrawer);
  await int1.grantRole(await int1.ANALYZER(), analyzer);

  // deploy token
  const tokenFactory = await ethers.getContractFactory("DummyToken");
  const token = await tokenFactory.deploy(admin, ethers.ZeroAddress);
  await token.waitForDeployment();
  console.log(`Dummy token deployed at: ${await token.getAddress()}`);

  const claimVerifierFactory = await ethers.getContractFactory(
    "ClaimPlonkVerifier"
  );
  const claimVerifier = await claimVerifierFactory.deploy();
  const minterFactory = await ethers.getContractFactory("MinterV1");
  const minter = (await upgrades.deployProxy(minterFactory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as MinterV1;
  await minter.waitForDeployment();
  console.log(`Minter deployed at: ${await minter.getAddress()}`);

  // initialize minter
  await minter.initialize(claimVerifier, token, int1, admin);

  await minter.grantRole(await minter.TREE_MANAGER(), treeManager);
  // add token's minter role to minter
  await token.grantRole(await token.MINTER_ROLE(), minter);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
