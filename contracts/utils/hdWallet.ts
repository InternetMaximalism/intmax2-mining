import { Wallet, ethers } from "ethers";
import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
dotenv.config();

export function getNthWallet(n: number, mnemonicStr: string): Wallet {
  const mnemonic = ethers.Mnemonic.fromPhrase(mnemonicStr);
  const hdNode = ethers.HDNodeWallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0");
  const hdWallet = hdNode.derivePath(`${n}`);
  const wallet = new ethers.Wallet(hdWallet.privateKey);
  return wallet;
}
