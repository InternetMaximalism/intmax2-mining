import { ethers } from "ethers";
import { cleanEnv, str } from "envalid";
import { rescue } from "../src/process/rescue";
import { getBalance } from "../src/utils/balance";
import { parse } from "ts-command-line-args";
import { IMnemonicArgs } from "../src/types/args";

async function main() {
  const args = parse<IMnemonicArgs>({
    mnemonic: String,
  });

  const env = cleanEnv(process.env, {
    INT0_MAIN_CONTRACT_ADDRESS: str(),
    INT0_SUB_CONTRACT_ADDRESS: str(),
  });
  const mainBalance = await getBalance(env.INT0_MAIN_CONTRACT_ADDRESS);
  if (mainBalance > ethers.parseEther("0.005")) {
    console.log(`Main contract balance: ${ethers.formatEther(mainBalance)}`);
    await rescue(args.mnemonic, true);
  }
  const subBalance = await getBalance(env.INT0_SUB_CONTRACT_ADDRESS);
  if (subBalance > ethers.parseEther("0.005")) {
    console.log(`Sub contract balance: ${ethers.formatEther(subBalance)}`);
    await rescue(args.mnemonic, false);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
