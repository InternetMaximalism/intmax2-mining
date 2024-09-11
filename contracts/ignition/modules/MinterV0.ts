import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
dotenv.config();

const Int0Module = buildModule("Int0", (m) => {
  const env = cleanEnv(process.env, {
    OWNER_ADDRESS: str(),
  });
  const verifier = m.contract("ClaimPlonkVerifier");
  const minterV0 = m.contract("MinterV0", [verifier, env.OWNER_ADDRESS], {
    id: "main",
  });
  return { minterV0 };
});

export default Int0Module;
