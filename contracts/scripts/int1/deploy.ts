import { ethers, upgrades } from "hardhat";
import { Int1, MinterV1 } from "../../typechain-types";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  WITHDRAWER_ADDRESS: str(),
  ANALYZER_ADDRESS: str(),
});

async function main() {
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

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

  // admin roles
  await int1
    .connect(admin)
    .grantRole(await int1.WITHDRAWER(), env.WITHDRAWER_ADDRESS);
  await int1
    .connect(admin)
    .grantRole(await int1.ANALYZER(), env.ANALYZER_ADDRESS);
  await token.connect(admin).grantRole(await token.MINTER_ROLE(), minter);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
