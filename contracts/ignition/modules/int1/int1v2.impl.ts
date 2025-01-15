import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Int1Module = buildModule("Int1V2", (m) => {
    const int1Impl = m.contract("Int1LV2");
    return { int1Impl };
});

export default Int1Module;
