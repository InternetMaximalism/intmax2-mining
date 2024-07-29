import dotenv from "dotenv";
import { getNthWallet } from "./utils/hdWallet";
import { sendEth } from "./process/sendEth";
import { ethers } from "ethers";
import { getBalance } from "./utils/balance";
import { parse } from "ts-command-line-args";
import { phase1 } from "./phases/phase1";
import { phase2 } from "./phases/phase2";
import { phase3 } from "./phases/phase3";
import { phase4 } from "./phases/phase4";
import { cleanEnv, num, str } from "envalid";
dotenv.config();

interface IMainArgs {
  mnemonic: string;
  phase: number;
  walletIndex: number;
}

async function main() {
  const env = cleanEnv(process.env, {
    DEPOSIT_AMOUNT: str(),
    NUM_PARTICIPANTS: num(),
    LOOP_SLEEP: num(),
  });

  const args = parse<IMainArgs>({
    mnemonic: String,
    phase: Number,
    walletIndex: Number,
  });
  const depositAmount = ethers.parseEther(env.DEPOSIT_AMOUNT);
  const numParticipants = env.NUM_PARTICIPANTS;
  const loopSleep = env.LOOP_SLEEP;

  const withdrawer = getNthWallet(0, args.mnemonic);
  const balance = await getBalance(withdrawer.address);
  console.log("num numParticipants", numParticipants);
  console.log("deposit amount: ", depositAmount.toString());
  console.log("Withdrawer address: ", withdrawer.address);
  console.log("Withdrawer balance: ", balance.toString());
  console.log("starting phase: ", args.phase);
  console.log("starting wallet index: ", args.walletIndex);

  await sleep(5000); // 5 seconds

  let walletIndex = args.walletIndex;
  let phase = args.phase;

  // create eth holder
  if (args.phase === 1 && args.walletIndex === 1) {
    console.log("Creating eth holders");
    if (balance < depositAmount * BigInt(numParticipants)) {
      throw new Error("Withdrawer balance is not enough");
    }
    for (let i = 0; i < numParticipants; i++) {
      await sendEth(args.mnemonic, withdrawer, walletIndex, depositAmount);
      walletIndex += 1;
      await sleep(1000);
    }
    console.log("Eth holders created");
    sleep(10000);
  }

  let loopCount = 0;
  while (true) {
    if (phase === 1) {
      console.log("Phase 1");
      try {
        await phase1(args.mnemonic, depositAmount);
      } catch (error) {
        console.error("current wallet Index: ", walletIndex);
        throw error;
      }
      console.log("Phase 1 done");
    } else if (phase === 2) {
      console.log("Phase 2");
      try {
        walletIndex = await phase2(args.mnemonic, withdrawer, walletIndex);
      } catch (error) {
        console.error("current wallet Index: ", walletIndex);
        throw error;
      }
      console.log("Phase 2 done");
    } else if (phase == 3) {
      console.log("Phase 3");
      try {
        await phase3(args.mnemonic, depositAmount);
      } catch (error) {
        console.error("current wallet Index: ", walletIndex);
        throw error;
      }
      console.log("Phase 3 done");
    } else if (phase == 4) {
      console.log("Phase 4");
      try {
        walletIndex = await phase4(args.mnemonic, withdrawer, walletIndex);
      } catch (error) {
        console.error("current wallet Index: ", walletIndex);
        throw error;
      }
      console.log("Phase 4 done");
    } else {
      throw new Error("Invalid phase");
    }
    phase += 1;
    if (phase > 4) {
      console.log("Loop count: ", loopCount);
      loopCount += 1;
      await sleep(loopSleep * 1000);
      phase = 1;
    }
    await sleep(5000); // 5 seconds
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
