import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const TokenModule = buildModule("Token", (m) => {
  const token = m.contract("INTMAXTokenL", [
    m.getParameter("admin"),
    ethers.ZeroAddress,
  ]);
  return { token };
});

export default TokenModule;
