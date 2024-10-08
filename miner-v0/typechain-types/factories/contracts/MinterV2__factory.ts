/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../common";
import type { MinterV2, MinterV2Interface } from "../../contracts/MinterV2";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "l1ScrollMessenger_",
        type: "address",
      },
      {
        internalType: "address",
        name: "mintVerifier_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidMintVerifier",
    type: "error",
  },
  {
    inputs: [],
    name: "MintVerifierNotSet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "SenderIsNotScrollMessenger",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "l1ScrollMessenger",
    outputs: [
      {
        internalType: "contract IL1ScrollMessenger",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "mintVerifier",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
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
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "nullifier",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        internalType: "struct ICommon.MintClaim[]",
        name: "claims",
        type: "tuple[]",
      },
    ],
    name: "processClaims",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "contract IINTMAXToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162000fb138038062000fb1833981810160405281019062000037919062000277565b33600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603620000ad5760006040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600401620000a49190620002cf565b60405180910390fd5b620000be816200014960201b60201c565b5081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050620002ec565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200023f8262000212565b9050919050565b620002518162000232565b81146200025d57600080fd5b50565b600081519050620002718162000246565b92915050565b600080604083850312156200029157620002906200020d565b5b6000620002a18582860162000260565b9250506020620002b48582860162000260565b9150509250929050565b620002c98162000232565b82525050565b6000602082019050620002e66000830184620002be565b92915050565b610cb580620002fc6000396000f3fe608060405234801561001057600080fd5b50600436106100875760003560e01c80638da5cb5b1161005b5780638da5cb5b146100da578063a98f7044146100f8578063f2fde38b14610116578063fc0c546a1461013257610087565b8062b0938d1461008c5780631249c58b146100aa5780633fa54ecb146100b4578063715018a6146100d0575b600080fd5b610094610150565b6040516100a191906107bc565b60405180910390f35b6100b2610176565b005b6100ce60048036038101906100c99190610a45565b61020d565b005b6100d8610519565b005b6100e261052d565b6040516100ef91906107bc565b60405180910390f35b610100610556565b60405161010d9190610aed565b60405180910390f35b610130600480360381019061012b9190610b08565b61057c565b005b61013a610602565b6040516101479190610b56565b60405180910390f35b600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b61017e610628565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16636a627842306040518263ffffffff1660e01b81526004016101d991906107bc565b600060405180830381600087803b1580156101f357600080fd5b505af1158015610207573d6000803e3d6000fd5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff16600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610295576040517fbf532f8900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461031c576040517fd8844f1500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16636e296e456040518163ffffffff1660e01b8152600401602060405180830381865afa158015610389573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103ad9190610b86565b73ffffffffffffffffffffffffffffffffffffffff16600360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610433576040517f6f7465cf00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60005b815181101561051557600082828151811061045457610453610bb3565b5b60200260200101519050600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb826000015183604001516040518363ffffffff1660e01b81526004016104c3929190610bf1565b6020604051808303816000875af11580156104e2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105069190610c52565b50508080600101915050610436565b5050565b610521610628565b61052b60006106af565b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b610584610628565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036105f65760006040517f1e4fbdf70000000000000000000000000000000000000000000000000000000081526004016105ed91906107bc565b60405180910390fd5b6105ff816106af565b50565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b610630610773565b73ffffffffffffffffffffffffffffffffffffffff1661064e61052d565b73ffffffffffffffffffffffffffffffffffffffff16146106ad57610671610773565b6040517f118cdaa70000000000000000000000000000000000000000000000000000000081526004016106a491906107bc565b60405180910390fd5b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006107a68261077b565b9050919050565b6107b68161079b565b82525050565b60006020820190506107d160008301846107ad565b92915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610839826107f0565b810181811067ffffffffffffffff8211171561085857610857610801565b5b80604052505050565b600061086b6107d7565b90506108778282610830565b919050565b600067ffffffffffffffff82111561089757610896610801565b5b602082029050602081019050919050565b600080fd5b600080fd5b6108bb8161079b565b81146108c657600080fd5b50565b6000813590506108d8816108b2565b92915050565b6000819050919050565b6108f1816108de565b81146108fc57600080fd5b50565b60008135905061090e816108e8565b92915050565b6000819050919050565b61092781610914565b811461093257600080fd5b50565b6000813590506109448161091e565b92915050565b6000606082840312156109605761095f6108ad565b5b61096a6060610861565b9050600061097a848285016108c9565b600083015250602061098e848285016108ff565b60208301525060406109a284828501610935565b60408301525092915050565b60006109c16109bc8461087c565b610861565b905080838252602082019050606084028301858111156109e4576109e36108a8565b5b835b81811015610a0d57806109f9888261094a565b8452602084019350506060810190506109e6565b5050509392505050565b600082601f830112610a2c57610a2b6107eb565b5b8135610a3c8482602086016109ae565b91505092915050565b600060208284031215610a5b57610a5a6107e1565b5b600082013567ffffffffffffffff811115610a7957610a786107e6565b5b610a8584828501610a17565b91505092915050565b6000819050919050565b6000610ab3610aae610aa98461077b565b610a8e565b61077b565b9050919050565b6000610ac582610a98565b9050919050565b6000610ad782610aba565b9050919050565b610ae781610acc565b82525050565b6000602082019050610b026000830184610ade565b92915050565b600060208284031215610b1e57610b1d6107e1565b5b6000610b2c848285016108c9565b91505092915050565b6000610b4082610aba565b9050919050565b610b5081610b35565b82525050565b6000602082019050610b6b6000830184610b47565b92915050565b600081519050610b80816108b2565b92915050565b600060208284031215610b9c57610b9b6107e1565b5b6000610baa84828501610b71565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b610beb81610914565b82525050565b6000604082019050610c0660008301856107ad565b610c136020830184610be2565b9392505050565b60008115159050919050565b610c2f81610c1a565b8114610c3a57600080fd5b50565b600081519050610c4c81610c26565b92915050565b600060208284031215610c6857610c676107e1565b5b6000610c7684828501610c3d565b9150509291505056fea2646970667358221220b0051d6de365c8ea340416ccc24c0998bc5e744c0ba87030db658948c271d4ee64736f6c63430008180033";

type MinterV2ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MinterV2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MinterV2__factory extends ContractFactory {
  constructor(...args: MinterV2ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    l1ScrollMessenger_: AddressLike,
    mintVerifier_: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(
      l1ScrollMessenger_,
      mintVerifier_,
      overrides || {}
    );
  }
  override deploy(
    l1ScrollMessenger_: AddressLike,
    mintVerifier_: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(
      l1ScrollMessenger_,
      mintVerifier_,
      overrides || {}
    ) as Promise<
      MinterV2 & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): MinterV2__factory {
    return super.connect(runner) as MinterV2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MinterV2Interface {
    return new Interface(_abi) as MinterV2Interface;
  }
  static connect(address: string, runner?: ContractRunner | null): MinterV2 {
    return new Contract(address, _abi, runner) as unknown as MinterV2;
  }
}
