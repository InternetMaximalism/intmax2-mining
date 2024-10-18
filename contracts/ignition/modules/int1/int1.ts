import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Int1Module = buildModule("Int1", (m) => {
  const int1Impl = m.contract("Int1L");
  const int1Proxy = m.contract("ERC1967Proxy", [int1Impl, "0x"]);
  const int1 = m.contractAt("Int1L", int1Proxy, {
    id: "int1",
  });

  return { int1 };
});

export default Int1Module;
