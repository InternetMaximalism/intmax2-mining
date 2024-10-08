/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IInt1,
  IInt1Interface,
} from "../../../contracts/interfaces/IInt1";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "depositDataHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "calculatedHash",
        type: "bytes32",
      },
    ],
    name: "InvalidDepositHash",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlySenderCanCancelDeposit",
    type: "error",
  },
  {
    inputs: [],
    name: "TriedToDepositZero",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "depositId",
        type: "uint256",
      },
    ],
    name: "DepositCanceled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "depositIndex",
        type: "uint32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "depositHash",
        type: "bytes32",
      },
    ],
    name: "DepositLeafInserted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "depositId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "recipientSaltHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "tokenIndex",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "depositedAt",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "upToDepositId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "rejectedIndices",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "bytes32[]",
        name: "depositHashes",
        type: "bytes32[]",
      },
    ],
    name: "DepositsAnalyzedAndProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "nullifier",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "tokenIndex",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "upToDepositId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "rejectDepositIds",
        type: "uint256[]",
      },
    ],
    name: "analyzeAndProcessDeposits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "recipientSaltHash",
        type: "bytes32",
      },
    ],
    name: "depositNativeToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "depositRoot",
        type: "bytes32",
      },
    ],
    name: "depositRoots",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDepositRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastDepositId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastProcessedDepositId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "depositRoot",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "nullifier",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "tokenIndex",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct IInt1.WithdrawalPublicInputs",
        name: "publicInputs",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class IInt1__factory {
  static readonly abi = _abi;
  static createInterface(): IInt1Interface {
    return new Interface(_abi) as IInt1Interface;
  }
  static connect(address: string, runner?: ContractRunner | null): IInt1 {
    return new Contract(address, _abi, runner) as unknown as IInt1;
  }
}
