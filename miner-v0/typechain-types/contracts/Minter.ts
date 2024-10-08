/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export declare namespace Minter {
  export type MintClaimStruct = {
    recipient: AddressLike;
    nullifier: BytesLike;
    amount: BigNumberish;
  };

  export type MintClaimStructOutput = [
    recipient: string,
    nullifier: string,
    amount: bigint
  ] & { recipient: string; nullifier: string; amount: bigint };

  export type ClaimPublicInputsStruct = {
    depositTreeRoot: BytesLike;
    eligibleTreeRoot: BytesLike;
    lastClaimHash: BytesLike;
  };

  export type ClaimPublicInputsStructOutput = [
    depositTreeRoot: string,
    eligibleTreeRoot: string,
    lastClaimHash: string
  ] & {
    depositTreeRoot: string;
    eligibleTreeRoot: string;
    lastClaimHash: string;
  };
}

export interface MinterInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "amountMultiplier"
      | "claimTokens"
      | "depositTreeRoot"
      | "eligibleTreeRoot"
      | "mint"
      | "owner"
      | "renounceOwnership"
      | "setAmountMultiplier"
      | "setDepositTreeRoot"
      | "setEligibleTreeRoot"
      | "token"
      | "transferOwnership"
      | "verifier"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;

  encodeFunctionData(
    functionFragment: "amountMultiplier",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "claimTokens",
    values: [
      Minter.MintClaimStruct[],
      Minter.ClaimPublicInputsStruct,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "depositTreeRoot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "eligibleTreeRoot",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "mint", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setAmountMultiplier",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setDepositTreeRoot",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setEligibleTreeRoot",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "token", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "verifier", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "amountMultiplier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositTreeRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "eligibleTreeRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAmountMultiplier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDepositTreeRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setEligibleTreeRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "verifier", data: BytesLike): Result;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface Minter extends BaseContract {
  connect(runner?: ContractRunner | null): Minter;
  waitForDeployment(): Promise<this>;

  interface: MinterInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  amountMultiplier: TypedContractMethod<[], [bigint], "view">;

  claimTokens: TypedContractMethod<
    [
      claims: Minter.MintClaimStruct[],
      publicInputs: Minter.ClaimPublicInputsStruct,
      proof: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  depositTreeRoot: TypedContractMethod<[], [string], "view">;

  eligibleTreeRoot: TypedContractMethod<[], [string], "view">;

  mint: TypedContractMethod<[], [void], "nonpayable">;

  owner: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setAmountMultiplier: TypedContractMethod<
    [amountMultiplier_: BigNumberish],
    [void],
    "nonpayable"
  >;

  setDepositTreeRoot: TypedContractMethod<
    [depositTreeRoot_: BytesLike],
    [void],
    "nonpayable"
  >;

  setEligibleTreeRoot: TypedContractMethod<
    [eligibleTreeRoot_: BytesLike],
    [void],
    "nonpayable"
  >;

  token: TypedContractMethod<[], [string], "view">;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  verifier: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "amountMultiplier"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "claimTokens"
  ): TypedContractMethod<
    [
      claims: Minter.MintClaimStruct[],
      publicInputs: Minter.ClaimPublicInputsStruct,
      proof: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "depositTreeRoot"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "eligibleTreeRoot"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "mint"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setAmountMultiplier"
  ): TypedContractMethod<
    [amountMultiplier_: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setDepositTreeRoot"
  ): TypedContractMethod<[depositTreeRoot_: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setEligibleTreeRoot"
  ): TypedContractMethod<[eligibleTreeRoot_: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "token"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "verifier"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
  };
}
