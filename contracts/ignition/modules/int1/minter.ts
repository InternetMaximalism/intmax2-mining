import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MinterV1Module = buildModule("Minter", (m) => {
  const minterImpl = m.contract("MinterV1L");
  const minterProxy = m.contract("ERC1967Proxy", [minterImpl, "0x"], {
    id: "int1",
  });
  const minterV1 = m.contractAt("MinterV1L", minterProxy, { id: "minterV1" });

  return { minterV1 };
});

export default MinterV1Module;
