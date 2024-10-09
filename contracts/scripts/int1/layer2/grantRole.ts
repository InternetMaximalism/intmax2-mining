import { ethers } from "hardhat";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  TESTNET_WITHDRAWER_ADDRESS: str(),
  TESTNET_ANALYZER_ADDRESS: str(),
  TESTNET_TREE_MANAGER_ADDRESS: str(),
});

async function main() {
  console.log(env);
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Deploying contracts with the admin account: ${admin.address}`);

  // sleep 20 secs to confirm the deployment
  await new Promise((resolve) => setTimeout(resolve, 20000));

  const int1 = await ethers.getContractAt(
    "Int1L",
    "0x5dfa05aAdbE75a92f6153508950533fC1bed98BE"
  );
  const token = await ethers.getContractAt(
    "INTMAXTokenL",
    "0x2699CD7f883DecC464171a7A92f4CcC4eF220fa2"
  );
  const minter = await ethers.getContractAt(
    "MinterV1L",
    "0xeF9CBc6F2f602AF19b0fEc2cc4F217177730858E"
  );

  // admin roles
  let tx = await int1
    .connect(admin)
    .grantRole(await int1.WITHDRAWER(), env.TESTNET_WITHDRAWER_ADDRESS);
  console.log(`Int1 WITHDRAWER role granted at: ${tx.hash}`);
  tx = await int1
    .connect(admin)
    .grantRole(await int1.ANALYZER(), env.TESTNET_ANALYZER_ADDRESS);
  console.log(`Int1 ANALYZER role granted at: ${tx.hash}`);
  tx = await token.connect(admin).grantRole(await token.MINTER_ROLE(), minter);
  console.log(`Token MINTER role granted at: ${tx.hash}`);
  tx = await minter
    .connect(admin)
    .grantRole(await minter.TREE_MANAGER(), env.TESTNET_TREE_MANAGER_ADDRESS);
  console.log(`Minter TREE_MANAGER role granted at: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
