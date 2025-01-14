import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MinterV1Module from "./minter";
import TokenModule from "./token";

const MiningV1Module = buildModule("MiningV1", (m) => {
  const claimVerifier = "0x4C66837A1b7987A2CEB167EFb4EdA56c31D24485";
  const { token } = m.useModule(TokenModule); // also needs redeploy
  const int1 = "0x195F9b5F42435bB71E9765E66a9bdFE40d44A895";
  const { minterV1 } = m.useModule(MinterV1Module); // also needs redeploy
  m.call(minterV1, "initialize", [
    claimVerifier,
    token,
    int1,
    m.getParameter("admin"),
  ]);

  return { minterV1, token };
});

export default MiningV1Module;
