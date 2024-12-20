import { ethers, upgrades } from "hardhat";
import { Int1, MinterV1 } from "../../../typechain-types";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  TESTNET_WITHDRAWER_ADDRESS: str(),
  TESTNET_ANALYZER_ADDRESS: str(),
  TESTNET_TREE_MANAGER_ADDRESS: str(),
});

async function main() {
  console.log(env);
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Deploying contracts with the admin account: ${admin.address}`);

  // sleep 20 secs to confirm the deployment
  await new Promise((resolve) => setTimeout(resolve, 20000));

  // deploy verifiers
  const withdrawalVerifierFactory = await ethers.getContractFactory(
    "V1WithdrawalPlonkVerifierV2"
  );
  const withdrawalVerifier = await withdrawalVerifierFactory.deploy();
  console.log(
    `Withdrawal verifier deployed at: ${await withdrawalVerifier.getAddress()}`
  );
  const claimVerifierFactory = await ethers.getContractFactory(
    "ClaimPlonkVerifierV2"
  );
  const claimVerifier = await claimVerifierFactory.deploy();
  console.log(
    `Claim verifier deployed at: ${await claimVerifier.getAddress()}`
  );

  // deploy token
  const tokenFactory = await ethers.getContractFactory("INTMAXTokenL");
  const token = await tokenFactory.deploy(admin, ethers.ZeroAddress);
  await token.waitForDeployment();
  console.log(`INTMAXToken token deployed at: ${await token.getAddress()}`);

  const int1Factory = await ethers.getContractFactory("Int1L");
  const int1 = (await upgrades.deployProxy(int1Factory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as Int1;
  await int1.waitForDeployment();
  console.log(`Int1 deployed at: ${await int1.getAddress()}`);

  const minterFactory = await ethers.getContractFactory("MinterV1L");
  const minter = (await upgrades.deployProxy(minterFactory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as MinterV1;
  await minter.waitForDeployment();
  console.log(`Minter deployed at: ${await minter.getAddress()}`);

  // sleep 60 secs to confirm the deployment
  await new Promise((resolve) => setTimeout(resolve, 60000));

  // initialize
  let tx = await int1.initialize(await withdrawalVerifier.getAddress(), admin);
  console.log(`Int1 initialized at: ${tx.hash}`);
  // initialize minter
  tx = await minter.initialize(claimVerifier, token, int1, admin);
  console.log(`Minter initialized at: ${tx.hash}`);

  // admin roles
  tx = await int1
    .connect(admin)
    .grantRole(await int1.WITHDRAWER(), env.TESTNET_WITHDRAWER_ADDRESS);
  console.log(`Int1 WITHDRAWER role granted at: ${tx.hash}`);
  tx = await int1
    .connect(admin)
    .grantRole(await int1.ANALYZER(), env.TESTNET_ANALYZER_ADDRESS);
  console.log(`Int1 ANALYZER role granted at: ${tx.hash}`);
  tx = await token.connect(admin).grantRole(await token.MINTER_ROLE(), minter);
  console.log(`Token MINTER role granted at: ${tx.hash}`);
  tx = await minter
    .connect(admin)
    .grantRole(await minter.TREE_MANAGER(), env.TESTNET_TREE_MANAGER_ADDRESS);
  console.log(`Minter TREE_MANAGER role granted at: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
