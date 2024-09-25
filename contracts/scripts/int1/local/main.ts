import { env } from "./setRoot";

export async function main() {
  const minter = await ethers.getContractAt(
    "Int1",
    env.LOCAL_INT1_CONTRACT_ADDRESS
  );
}
