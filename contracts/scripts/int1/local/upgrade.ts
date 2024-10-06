import { ethers, upgrades } from "hardhat";
import { Int1, Int1V2, MinterV1 } from "../../../typechain-types";

const int1Address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const minterV1Address = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

async function main() {
  const [deployer, admin] = await ethers.getSigners();
  const newWithdrawalVerifierFactory = await ethers.getContractFactory(
    "V1WithdrawalPlonkVerifierV2"
  );
  const newWithdrawalVerifier = await newWithdrawalVerifierFactory.deploy();
  console.log(
    "New withdrawal verifier deployed at:",
    await newWithdrawalVerifier.getAddress()
  );

  const newClaimVerifierFactory = await ethers.getContractFactory(
    "ClaimPlonkVerifierV2"
  );
  const newClaimVerifier = await newClaimVerifierFactory.deploy();
  console.log(
    "New claim verifier deployed at:",
    await newClaimVerifier.getAddress()
  );

  const newInt1Factory = await ethers.getContractFactory("Int1V2", deployer);
  const newInt1 = (await upgrades.upgradeProxy(
    int1Address,
    newInt1Factory
  )) as unknown as Int1V2;

  console.log("Int1 upgraded at:", await newInt1.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
