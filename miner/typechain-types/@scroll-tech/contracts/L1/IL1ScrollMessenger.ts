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
} from "../../../common";

export declare namespace IL1ScrollMessenger {
  export type L2MessageProofStruct = {
    batchIndex: BigNumberish;
    merkleProof: BytesLike;
  };

  export type L2MessageProofStructOutput = [
    batchIndex: bigint,
    merkleProof: string
  ] & { batchIndex: bigint; merkleProof: string };
}

export interface IL1ScrollMessengerInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "dropMessage"
      | "relayMessageWithProof"
      | "replayMessage"
      | "sendMessage(address,uint256,bytes,uint256,address)"
      | "sendMessage(address,uint256,bytes,uint256)"
      | "xDomainMessageSender"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "FailedRelayedMessage"
      | "RelayedMessage"
      | "SentMessage"
      | "UpdateMaxReplayTimes"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "dropMessage",
    values: [AddressLike, AddressLike, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "relayMessageWithProof",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      BytesLike,
      IL1ScrollMessenger.L2MessageProofStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "replayMessage",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      BytesLike,
      BigNumberish,
      AddressLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "sendMessage(address,uint256,bytes,uint256,address)",
    values: [AddressLike, BigNumberish, BytesLike, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "sendMessage(address,uint256,bytes,uint256)",
    values: [AddressLike, BigNumberish, BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "xDomainMessageSender",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "dropMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "relayMessageWithProof",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "replayMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "sendMessage(address,uint256,bytes,uint256,address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "sendMessage(address,uint256,bytes,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "xDomainMessageSender",
    data: BytesLike
  ): Result;
}

export namespace FailedRelayedMessageEvent {
  export type InputTuple = [messageHash: BytesLike];
  export type OutputTuple = [messageHash: string];
  export interface OutputObject {
    messageHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RelayedMessageEvent {
  export type InputTuple = [messageHash: BytesLike];
  export type OutputTuple = [messageHash: string];
  export interface OutputObject {
    messageHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SentMessageEvent {
  export type InputTuple = [
    sender: AddressLike,
    target: AddressLike,
    value: BigNumberish,
    messageNonce: BigNumberish,
    gasLimit: BigNumberish,
    message: BytesLike
  ];
  export type OutputTuple = [
    sender: string,
    target: string,
    value: bigint,
    messageNonce: bigint,
    gasLimit: bigint,
    message: string
  ];
  export interface OutputObject {
    sender: string;
    target: string;
    value: bigint;
    messageNonce: bigint;
    gasLimit: bigint;
    message: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpdateMaxReplayTimesEvent {
  export type InputTuple = [maxReplayTimes: BigNumberish];
  export type OutputTuple = [maxReplayTimes: bigint];
  export interface OutputObject {
    maxReplayTimes: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IL1ScrollMessenger extends BaseContract {
  connect(runner?: ContractRunner | null): IL1ScrollMessenger;
  waitForDeployment(): Promise<this>;

  interface: IL1ScrollMessengerInterface;

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

  dropMessage: TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      value: BigNumberish,
      messageNonce: BigNumberish,
      message: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  relayMessageWithProof: TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      value: BigNumberish,
      nonce: BigNumberish,
      message: BytesLike,
      proof: IL1ScrollMessenger.L2MessageProofStruct
    ],
    [void],
    "nonpayable"
  >;

  replayMessage: TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      value: BigNumberish,
      messageNonce: BigNumberish,
      message: BytesLike,
      newGasLimit: BigNumberish,
      refundAddress: AddressLike
    ],
    [void],
    "payable"
  >;

  "sendMessage(address,uint256,bytes,uint256,address)": TypedContractMethod<
    [
      target: AddressLike,
      value: BigNumberish,
      message: BytesLike,
      gasLimit: BigNumberish,
      refundAddress: AddressLike
    ],
    [void],
    "payable"
  >;

  "sendMessage(address,uint256,bytes,uint256)": TypedContractMethod<
    [
      target: AddressLike,
      value: BigNumberish,
      message: BytesLike,
      gasLimit: BigNumberish
    ],
    [void],
    "payable"
  >;

  xDomainMessageSender: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "dropMessage"
  ): TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      value: BigNumberish,
      messageNonce: BigNumberish,
      message: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "relayMessageWithProof"
  ): TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      value: BigNumberish,
      nonce: BigNumberish,
      message: BytesLike,
      proof: IL1ScrollMessenger.L2MessageProofStruct
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "replayMessage"
  ): TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      value: BigNumberish,
      messageNonce: BigNumberish,
      message: BytesLike,
      newGasLimit: BigNumberish,
      refundAddress: AddressLike
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "sendMessage(address,uint256,bytes,uint256,address)"
  ): TypedContractMethod<
    [
      target: AddressLike,
      value: BigNumberish,
      message: BytesLike,
      gasLimit: BigNumberish,
      refundAddress: AddressLike
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "sendMessage(address,uint256,bytes,uint256)"
  ): TypedContractMethod<
    [
      target: AddressLike,
      value: BigNumberish,
      message: BytesLike,
      gasLimit: BigNumberish
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "xDomainMessageSender"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "FailedRelayedMessage"
  ): TypedContractEvent<
    FailedRelayedMessageEvent.InputTuple,
    FailedRelayedMessageEvent.OutputTuple,
    FailedRelayedMessageEvent.OutputObject
  >;
  getEvent(
    key: "RelayedMessage"
  ): TypedContractEvent<
    RelayedMessageEvent.InputTuple,
    RelayedMessageEvent.OutputTuple,
    RelayedMessageEvent.OutputObject
  >;
  getEvent(
    key: "SentMessage"
  ): TypedContractEvent<
    SentMessageEvent.InputTuple,
    SentMessageEvent.OutputTuple,
    SentMessageEvent.OutputObject
  >;
  getEvent(
    key: "UpdateMaxReplayTimes"
  ): TypedContractEvent<
    UpdateMaxReplayTimesEvent.InputTuple,
    UpdateMaxReplayTimesEvent.OutputTuple,
    UpdateMaxReplayTimesEvent.OutputObject
  >;

  filters: {
    "FailedRelayedMessage(bytes32)": TypedContractEvent<
      FailedRelayedMessageEvent.InputTuple,
      FailedRelayedMessageEvent.OutputTuple,
      FailedRelayedMessageEvent.OutputObject
    >;
    FailedRelayedMessage: TypedContractEvent<
      FailedRelayedMessageEvent.InputTuple,
      FailedRelayedMessageEvent.OutputTuple,
      FailedRelayedMessageEvent.OutputObject
    >;

    "RelayedMessage(bytes32)": TypedContractEvent<
      RelayedMessageEvent.InputTuple,
      RelayedMessageEvent.OutputTuple,
      RelayedMessageEvent.OutputObject
    >;
    RelayedMessage: TypedContractEvent<
      RelayedMessageEvent.InputTuple,
      RelayedMessageEvent.OutputTuple,
      RelayedMessageEvent.OutputObject
    >;

    "SentMessage(address,address,uint256,uint256,uint256,bytes)": TypedContractEvent<
      SentMessageEvent.InputTuple,
      SentMessageEvent.OutputTuple,
      SentMessageEvent.OutputObject
    >;
    SentMessage: TypedContractEvent<
      SentMessageEvent.InputTuple,
      SentMessageEvent.OutputTuple,
      SentMessageEvent.OutputObject
    >;

    "UpdateMaxReplayTimes(uint256)": TypedContractEvent<
      UpdateMaxReplayTimesEvent.InputTuple,
      UpdateMaxReplayTimesEvent.OutputTuple,
      UpdateMaxReplayTimesEvent.OutputObject
    >;
    UpdateMaxReplayTimes: TypedContractEvent<
      UpdateMaxReplayTimesEvent.InputTuple,
      UpdateMaxReplayTimesEvent.OutputTuple,
      UpdateMaxReplayTimesEvent.OutputObject
    >;
  };
}