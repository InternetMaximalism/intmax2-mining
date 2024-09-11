import { ethers, upgrades } from "hardhat";
import { Int1 } from "../../typechain-types";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  ANALYZER_ADDRESS: str(),
});

async function main() {
  const withdrawalVerifierFactory = await ethers.getContractFactory(
    "WithdrawalPlonkVerifier"
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
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
