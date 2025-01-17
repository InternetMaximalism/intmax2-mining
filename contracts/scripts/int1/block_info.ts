import { ethers } from "hardhat";

async function main() {
    const block = await ethers.provider.getBlock("0x1f502fb909615f40343156e647d3102d7c905e4e24545b7745f4ce4e93ae3346");
    console.log(block);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
