import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { cleanEnv, str } from "envalid";

const Int0Module = buildModule("Int0", (m) => {
  const env = cleanEnv(process.env, {
    OWNER_ADDRESS: str(),
  });
  const verifier = m.contract("WithdrawalPlonkVerifier");
  const int0_main = m.contract("Int0", [verifier, env.OWNER_ADDRESS], {
    id: "main",
  });
  const int0_sub = m.contract("Int0", [verifier, env.OWNER_ADDRESS], {
    id: "sub",
  });
  return { int0_main, int0_sub };
});

export default Int0Module;
