import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VerifiersModule = buildModule("Verifiers", (m) => {
  const withdrawalVerifier = m.contract("V1WithdrawalPlonkVerifierV2");
  const claimVerifier = m.contract("ClaimPlonkVerifierV2", []);
  return { withdrawalVerifier, claimVerifier };
});

export default VerifiersModule;
