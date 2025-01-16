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

  m.call(token, "grantRole", [
    "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
    minterV1,
  ]);
  const treeManager = "0x9c843A9a65B85423Fd9F2A674C2AC186809E377A";
  m.call(minterV1, "grantRole", ["0x92a34060481126178f80fd86c2c51038c6d11c21120b77079571cc3abf1d746b", treeManager]);

  return { minterV1, token };
});

export default MiningV1Module;
