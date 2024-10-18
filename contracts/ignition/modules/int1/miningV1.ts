import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ignition } from "hardhat";
import VerifiersModule from "./verifiers";
import Int1Module from "./int1";
import MinterV1Module from "./minter";
import TokenModule from "./token";

const MiningV1Module = buildModule("MiningV1", (m) => {
  const { withdrawalVerifier, claimVerifier } = m.useModule(VerifiersModule);
  const { token } = m.useModule(TokenModule);
  const { int1 } = m.useModule(Int1Module);
  const { minterV1 } = m.useModule(MinterV1Module);

  // initialize
  m.call(int1, "initialize", [ withdrawalVerifier, m.getParameter("admin")]);
  m.call(minterV1, "initialize", [
    claimVerifier,
    token,
    int1,
    m.getParameter("admin"),
  ]);

  return { int1, minterV1, token };
});

export default MiningV1Module;
