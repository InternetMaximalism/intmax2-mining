import { ethers, upgrades } from "hardhat";
import { Int1 } from "../../typechain-types";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  ANALYZER_ADDRESS: str(),
  MINTER_V1_ADMIN_ADDRESS: str(),
  WITHDRAWER_ADDRESS: str(),
});

async function main() {
  console.log("env", env);

  const [admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${admin.address}`);

  const withdrawalVerifierFactory = await ethers.getContractFactory(
    "V1WithdrawalPlonkVerifier"
  );
  const withdrawalVerifier = await withdrawalVerifierFactory.deploy();

  const int1Factory = await ethers.getContractFactory("Int1");
  const int1 = (await upgrades.deployProxy(int1Factory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as Int1;

  console.log(`Int1 deployed at: ${await int1.getAddress()}`);
  // sleep for 60 seconds to wait for the proxy to be deployed
  await new Promise((resolve) => setTimeout(resolve, 60000));

  // initialize
  await int1.initialize(
    await withdrawalVerifier.getAddress(),
    env.ANALYZER_ADDRESS
  );
  // grant role
  await int1.grantRole(await int1.WITHDRAWER(), env.WITHDRAWER_ADDRESS);

  // deploy token
  const tokenFactory = await ethers.getContractFactory("DummyToken");
  const token = await tokenFactory.deploy(admin, ethers.ZeroAddress);
  console.log(`Dummy token deployed at: ${await token.getAddress()}`);

  const claimVerifierFactory = await ethers.getContractFactory(
    "ClaimPlonkVerifier"
  );
  const claimVerifier = await claimVerifierFactory.deploy();
  const minterFactory = await ethers.getContractFactory("MinterV1");
  const minter = await minterFactory.deploy(
    claimVerifier,
    token,
    int1,
    env.MINTER_V1_ADMIN_ADDRESS
  );
  console.log(`Minter deployed at: ${await minter.getAddress()}`);

  // sleep for 60 seconds to wait for the proxy to be deployed
  await new Promise((resolve) => setTimeout(resolve, 60000));

  // add token's minter role to minter
  await token.grantRole(await token.MINTER_ROLE(), minter);
  // await minter.mint();
  // const balance = await token.balanceOf(minter);
  // console.log(`Minter's balance: ${ethers.formatEther(balance)}`);

  // fund analyzer
  const analyzerBalance = await ethers.provider.getBalance(
    env.ANALYZER_ADDRESS
  );
  if (analyzerBalance === 0n) {
    const signer = (await ethers.getSigners())[0];
    await signer.sendTransaction({
      to: env.ANALYZER_ADDRESS,
      value: ethers.parseEther("0.01"),
    });
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
