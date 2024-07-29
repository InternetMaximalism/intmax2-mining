import { cleanEnv, str } from "envalid";
import { Int0__factory } from "../../typechain-types";
import { getNthWallet } from "../utils/hdWallet";

export async function rescue(mnemonicStr: string, isMain: boolean) {
  const env = cleanEnv(process.env, {
    INT0_MAIN_CONTRACT_ADDRESS: str(),
    INT0_SUB_CONTRACT_ADDRESS: str(),
  });
  const contractAddress = isMain
    ? env.INT0_MAIN_CONTRACT_ADDRESS
    : env.INT0_SUB_CONTRACT_ADDRESS;
  const withdrawer = getNthWallet(0, mnemonicStr);
  const int0 = Int0__factory.connect(contractAddress, withdrawer);
  const tx = await int0.rescue();
  await tx.wait();
  console.log(`Rescued tx hash:${tx.hash}`);
}
