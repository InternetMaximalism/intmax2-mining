import { cleanEnv, str } from "envalid";
import { ethers } from "ethers";

export async function getGasPrice(): Promise<bigint> {
  const env = cleanEnv(process.env, {
    RPC_URL: str(),
  });
  const provider = new ethers.JsonRpcProvider(env.RPC_URL);
  const feeData = await provider.getFeeData();
  if (!feeData?.gasPrice) {
    throw new Error("Failed to get gas price");
  }
  const offset = 2n * 10n ** 9n; // 2 Gwei
  return feeData.gasPrice + offset;
}
