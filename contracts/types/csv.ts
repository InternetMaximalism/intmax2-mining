export interface DepositCsvRow {
  pubkey: string;
  salt: string;
  pubkeySaltHash: string;
  leafIndex: string;
  depositor: string;
  depositedAt: string;
}

export interface WithdrawalCsvRow {
  pubkey: string;
  salt: string;
  pubkeySaltHash: string;
  leafIndex: string;
  depositedAt: string;
  depositor: string;
  withdrawer: string;
  withdrawnAt: string;
}
