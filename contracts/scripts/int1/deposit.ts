import { cleanEnv, str } from "envalid";
import { ethers } from "hardhat";
import { getRandomPubkey, getRandomSalt } from "../../utils/rand";
import { getPubkeySaltHash } from "../../utils/hash";

const env = cleanEnv(process.env, {
  INT1_CONTRACT_ADDRESS: str(),
});

async function main() {
  const int1 = await ethers.getContractAt("Int1", env.INT1_CONTRACT_ADDRESS);

  // deposit 1 ETH × 3 times
  for (let i = 0; i < 3; i++) {
    const pubkey = getRandomPubkey();
    const salt = getRandomSalt();
    const pubkeySaltHash = getPubkeySaltHash(pubkey, salt);
    const tx = await int1.depositNativeToken(pubkeySaltHash, {
      value: ethers.parseEther("1"),
    });
  }

  const lastDepositId = await int1.getLastDepositId();
  console.log(`Last deposit ID: ${lastDepositId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
