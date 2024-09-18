import { ethers, upgrades } from "hardhat";
import { Int1 } from "../../typechain-types";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  ANALYZER_ADDRESS: str(),
});

async function main() {
  const [admin] = await ethers.getSigners();

  const withdrawalVerifierFactory = await ethers.getContractFactory(
    "V1WithdrawalPlonkVerifier"
  );
  const withdrawalVerifier = await withdrawalVerifierFactory.deploy();

  const int1Factory = await ethers.getContractFactory("Int1");
  const int1 = (await upgrades.deployProxy(int1Factory, [], {
    initializer: false,
    kind: "uups",
  })) as unknown as Int1;

  // initialize
  await int1.initialize(
    await withdrawalVerifier.getAddress(),
    env.ANALYZER_ADDRESS
  );
  console.log(`Int1 deployed at: ${await int1.getAddress()}`);

  // deploy token
  const tokenFactory = await ethers.getContractFactory("DummyToken");
  const token = await tokenFactory.deploy(admin, ethers.ZeroAddress);

  const claimVerifierFactory = await ethers.getContractFactory(
    "ClaimPlonkVerifier"
  );
  const claimVerifier = await claimVerifierFactory.deploy();
  const minterFactory = await ethers.getContractFactory("MinterV1");
  const minter = await minterFactory.deploy(claimVerifier, token, int1, admin);
  console.log(`Minter deployed at: ${await minter.getAddress()}`);

  // add token's minter role to minter
  await token.grantRole(await token.MINTER_ROLE(), minter);
  await minter.mint();
  const balance = await token.balanceOf(minter);
  console.log(`Minter's balance: ${ethers.formatEther(balance)}`);

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
