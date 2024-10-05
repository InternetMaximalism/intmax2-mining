import { ethers } from "hardhat";

async function main() {
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
