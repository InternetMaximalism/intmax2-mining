module.exports = {
  apps: [
    {
      name: "miner",
      script: "src/main.ts",
      interpreter: "ts-node",
      watch: true,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        INT0_MAIN_CONTRACT_ADDRESS: process.env.INT0_MAIN_CONTRACT_ADDRESS,
        INT0_SUB_CONTRACT_ADDRESS: process.env.INT0_SUB_CONTRACT_ADDRESS,
        MNEMONIC: process.env.MNEMONIC,
        RPC_URL: process.env.RPC_URL,
      },
    },
  ],
};
