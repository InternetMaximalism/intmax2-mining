import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const TokenV2Module = buildModule("TokenV2", (m) => {
  const token = m.contract("INTMAXTokenLV2", [m.getParameter("admin")]);
  return { token };
});

export default TokenV2Module;
