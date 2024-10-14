import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
import { ignition } from "hardhat";
import VerifiersModule from "./verifiers";
dotenv.config();

const MiningV1Module = buildModule("MiningV1", (m) => {
  const { withdrawalVerifier, claimVerifier } = m.useModule(VerifiersModule);
  const int1_impl = m.contract("Int1L");
  const int1 = m.contract("ERC1967Proxy", [int1_impl, "0x"], {
    id: "int1",
  });
  const minter_impl = m.contract("MinterV1L");
  const minter = m.contract("ERC1967Proxy", [minter_impl, "0x"], {
    id: "minter",
  });

  // initialize
  m.call(int1, "initialize", [m.getParameter("admin"), withdrawalVerifier]);

  return { int1, minter };
});

export default MiningV1Module;
