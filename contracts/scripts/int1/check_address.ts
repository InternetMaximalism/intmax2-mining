async function main() {
    const [deployer, admin] = await ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}`);
    console.log(`Deploying contracts with the admin account: ${admin.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
