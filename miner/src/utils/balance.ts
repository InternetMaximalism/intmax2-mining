import { cleanEnv, str } from "envalid";
import { AddressLike, ethers } from "ethers";

export async function getBalance(address: AddressLike): Promise<bigint> {
  const env = cleanEnv(process.env, {
    RPC_URL: str(),
  });
  const provider = new ethers.JsonRpcProvider(env.RPC_URL);
  const balance = await provider.getBalance(address);
  return balance;
}
