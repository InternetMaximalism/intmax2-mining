import { ethers } from "hardhat";

const withdrawalVerifier = "0x8877749FEF640b3AF16996F82A9afA1B6DB0427d";
const claimVerifier = "0xA65732c6db2b2AE2f1154CC0002F121713540C76";
const int1Address = "0x50f8A0956B1c41fA7884637ecf8322aba7e02369";
const minterAddress = "0xDb3b66830b42dF8bB0316D783Ba4Ff5A9C212D51";

async function main() {
  const [deployer, admin] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Deploying contracts with the admin account: ${admin.address}`);

  new Promise((resolve) => setTimeout(resolve, 20000));

  const int1 = await ethers.getContractAt("Int1V2", int1Address, admin);
  const tx = await int1.setVerifier(withdrawalVerifier);
  console.log(`Int1 verifier set at: ${tx.hash}`);

  const minter = await ethers.getContractAt("MinterV1V2", minterAddress, admin);
  const tx2 = await minter.setVerifier(claimVerifier);
  console.log(`Minter verifier set at: ${tx2.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
