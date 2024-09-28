import { ethers } from "hardhat";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  SEPOLIA_WITHDRAWER_ADDRESS: str(),
  SEPOLIA_ANALYZER_ADDRESS: str(),
  SEPOLIA_TREE_MANAGER_ADDRESS: str(),
});

async function main() {
  console.log(env);
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Deploying contracts with the admin account: ${admin.address}`);

  // sleep 20 secs to confirm the deployment
  await new Promise((resolve) => setTimeout(resolve, 20000));

  const int1 = await ethers.getContractAt(
    "Int1",
    "0x50f8A0956B1c41fA7884637ecf8322aba7e02369"
  );
  const token = await ethers.getContractAt(
    "DummyToken",
    "0x78801e4e578860bbcd72A7c79aA363D762d52351"
  );
  const minter = await ethers.getContractAt(
    "MinterV1",
    "0x8fFe60b2d9dF36f40776E8F0bfBE750C370033FF"
  );

  // admin roles
  let tx = await int1
    .connect(admin)
    .grantRole(await int1.WITHDRAWER(), env.SEPOLIA_WITHDRAWER_ADDRESS);
  console.log(`Int1 WITHDRAWER role granted at: ${tx.hash}`);
  tx = await int1
    .connect(admin)
    .grantRole(await int1.ANALYZER(), env.SEPOLIA_ANALYZER_ADDRESS);
  console.log(`Int1 ANALYZER role granted at: ${tx.hash}`);
  tx = await token.connect(admin).grantRole(await token.MINTER_ROLE(), minter);
  console.log(`Token MINTER role granted at: ${tx.hash}`);
  tx = await minter
    .connect(admin)
    .grantRole(await minter.TREE_MANAGER(), env.SEPOLIA_TREE_MANAGER_ADDRESS);
  console.log(`Minter TREE_MANAGER role granted at: ${tx.hash}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
