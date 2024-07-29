export interface EthHolderCsvRow {
  walletIndex: number;
  address: string;
  balance: string;
  txHash: string;
}

export interface DepositCsvRow {
  pubkey: string;
  salt: string;
  pubkeySaltHash: string;
  leafIndex: string;
  depositorIndex: number;
  depositTxHash: string;
}

export interface WithdrawalCsvRow {
  pubkey: string;
  salt: string;
  pubkeySaltHash: string;
  leafIndex: string;
  depositorIndex: number;
  depositTxHash: string;
  toWalletIndex: number;
  withdrawalTxHash: string;
}

export const EthHolderCsvRowKeys = [
  "walletIndex",
  "address",
  "balance",
  "txHash",
];
export const DepositCsvRowKeys = [
  "pubkey",
  "salt",
  "pubkeySaltHash",
  "leafIndex",
  "depositorIndex",
  "depositTxHash",
];
