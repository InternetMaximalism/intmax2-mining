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

export declare namespace DepositLib {
  export type DepositStruct = {
    recipientSaltHash: BytesLike;
    tokenIndex: BigNumberish;
    amount: BigNumberish;
  };

  export type DepositStructOutput = [
    recipientSaltHash: string,
    tokenIndex: bigint,
    amount: bigint
  ] & { recipientSaltHash: string; tokenIndex: bigint; amount: bigint };
}

export declare namespace DepositQueueLib {
  export type DepositDataStruct = {
    depositHash: BytesLike;
    sender: AddressLike;
    isRejected: boolean;
  };

  export type DepositDataStructOutput = [
    depositHash: string,
    sender: string,
    isRejected: boolean
  ] & { depositHash: string; sender: string; isRejected: boolean };
}

export declare namespace IInt1 {
  export type WithdrawalPublicInputsStruct = {
    depositRoot: BytesLike;
    nullifier: BytesLike;
    recipient: AddressLike;
    tokenIndex: BigNumberish;
    amount: BigNumberish;
  };

  export type WithdrawalPublicInputsStructOutput = [
    depositRoot: string,
    nullifier: string,
    recipient: string,
    tokenIndex: bigint,
    amount: bigint
  ] & {
    depositRoot: string;
    nullifier: string;
    recipient: string;
    tokenIndex: bigint;
    amount: bigint;
  };
}

export interface Int1Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "ANALYZER"
      | "DEFAULT_ADMIN_ROLE"
      | "UPGRADE_INTERFACE_VERSION"
      | "analyzeAndProcessDeposits"
      | "cancelDeposit"
      | "depositIndex"
      | "depositNativeToken"
      | "depositRoots"
      | "getDepositData"
      | "getDepositDataBatch"
      | "getDepositRoot"
      | "getLastDepositId"
      | "getLastProcessedDepositId"
      | "getRoleAdmin"
      | "grantRole"
      | "hasRole"
      | "initialize"
      | "nullifiers"
      | "proxiableUUID"
      | "renounceRole"
      | "revokeRole"
      | "supportsInterface"
      | "upgradeToAndCall"
      | "verifyProof"
      | "withdraw"
      | "withdrawalVerifier"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "DepositCanceled"
      | "DepositLeafInserted"
      | "Deposited"
      | "DepositsAnalyzedAndProcessed"
      | "Initialized"
      | "RoleAdminChanged"
      | "RoleGranted"
      | "RoleRevoked"
      | "Upgraded"
      | "Withdrawn"
  ): EventFragment;

  encodeFunctionData(functionFragment: "ANALYZER", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "UPGRADE_INTERFACE_VERSION",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "analyzeAndProcessDeposits",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "cancelDeposit",
    values: [BigNumberish, DepositLib.DepositStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "depositIndex",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "depositNativeToken",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "depositRoots",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositData",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositDataBatch",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositRoot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLastDepositId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLastProcessedDepositId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "grantRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "nullifiers",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "proxiableUUID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRole",
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [AddressLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyProof",
    values: [IInt1.WithdrawalPublicInputsStruct, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [IInt1.WithdrawalPublicInputsStruct, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawalVerifier",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "ANALYZER", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "UPGRADE_INTERFACE_VERSION",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "analyzeAndProcessDeposits",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cancelDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositNativeToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositRoots",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDepositData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDepositDataBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDepositRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLastDepositId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLastProcessedDepositId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "nullifiers", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "proxiableUUID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyProof",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawalVerifier",
    data: BytesLike
  ): Result;
}

export namespace DepositCanceledEvent {
  export type InputTuple = [depositId: BigNumberish];
  export type OutputTuple = [depositId: bigint];
  export interface OutputObject {
    depositId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DepositLeafInsertedEvent {
  export type InputTuple = [depositIndex: BigNumberish, depositHash: BytesLike];
  export type OutputTuple = [depositIndex: bigint, depositHash: string];
  export interface OutputObject {
    depositIndex: bigint;
    depositHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DepositedEvent {
  export type InputTuple = [
    depositId: BigNumberish,
    sender: AddressLike,
    recipientSaltHash: BytesLike,
    tokenIndex: BigNumberish,
    amount: BigNumberish,
    depositedAt: BigNumberish
  ];
  export type OutputTuple = [
    depositId: bigint,
    sender: string,
    recipientSaltHash: string,
    tokenIndex: bigint,
    amount: bigint,
    depositedAt: bigint
  ];
  export interface OutputObject {
    depositId: bigint;
    sender: string;
    recipientSaltHash: string;
    tokenIndex: bigint;
    amount: bigint;
    depositedAt: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DepositsAnalyzedAndProcessedEvent {
  export type InputTuple = [
    upToDepositId: BigNumberish,
    rejectedIndices: BigNumberish[],
    depositHashes: BytesLike[]
  ];
  export type OutputTuple = [
    upToDepositId: bigint,
    rejectedIndices: bigint[],
    depositHashes: string[]
  ];
  export interface OutputObject {
    upToDepositId: bigint;
    rejectedIndices: bigint[];
    depositHashes: string[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleAdminChangedEvent {
  export type InputTuple = [
    role: BytesLike,
    previousAdminRole: BytesLike,
    newAdminRole: BytesLike
  ];
  export type OutputTuple = [
    role: string,
    previousAdminRole: string,
    newAdminRole: string
  ];
  export interface OutputObject {
    role: string;
    previousAdminRole: string;
    newAdminRole: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleGrantedEvent {
  export type InputTuple = [
    role: BytesLike,
    account: AddressLike,
    sender: AddressLike
  ];
  export type OutputTuple = [role: string, account: string, sender: string];
  export interface OutputObject {
    role: string;
    account: string;
    sender: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace RoleRevokedEvent {
  export type InputTuple = [
    role: BytesLike,
    account: AddressLike,
    sender: AddressLike
  ];
  export type OutputTuple = [role: string, account: string, sender: string];
  export interface OutputObject {
    role: string;
    account: string;
    sender: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpgradedEvent {
  export type InputTuple = [implementation: AddressLike];
  export type OutputTuple = [implementation: string];
  export interface OutputObject {
    implementation: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WithdrawnEvent {
  export type InputTuple = [
    recipient: AddressLike,
    nullifier: BytesLike,
    tokenIndex: BigNumberish,
    amount: BigNumberish
  ];
  export type OutputTuple = [
    recipient: string,
    nullifier: string,
    tokenIndex: bigint,
    amount: bigint
  ];
  export interface OutputObject {
    recipient: string;
    nullifier: string;
    tokenIndex: bigint;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface Int1 extends BaseContract {
  connect(runner?: ContractRunner | null): Int1;
  waitForDeployment(): Promise<this>;

  interface: Int1Interface;

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

  ANALYZER: TypedContractMethod<[], [string], "view">;

  DEFAULT_ADMIN_ROLE: TypedContractMethod<[], [string], "view">;

  UPGRADE_INTERFACE_VERSION: TypedContractMethod<[], [string], "view">;

  analyzeAndProcessDeposits: TypedContractMethod<
    [upToDepositId: BigNumberish, rejectDepositIds: BigNumberish[]],
    [void],
    "nonpayable"
  >;

  cancelDeposit: TypedContractMethod<
    [depositId: BigNumberish, deposit: DepositLib.DepositStruct],
    [void],
    "nonpayable"
  >;

  depositIndex: TypedContractMethod<[], [bigint], "view">;

  depositNativeToken: TypedContractMethod<
    [recipientSaltHash: BytesLike],
    [void],
    "payable"
  >;

  depositRoots: TypedContractMethod<[arg0: BytesLike], [bigint], "view">;

  getDepositData: TypedContractMethod<
    [depositId: BigNumberish],
    [DepositQueueLib.DepositDataStructOutput],
    "view"
  >;

  getDepositDataBatch: TypedContractMethod<
    [depositIds: BigNumberish[]],
    [DepositQueueLib.DepositDataStructOutput[]],
    "view"
  >;

  getDepositRoot: TypedContractMethod<[], [string], "view">;

  getLastDepositId: TypedContractMethod<[], [bigint], "view">;

  getLastProcessedDepositId: TypedContractMethod<[], [bigint], "view">;

  getRoleAdmin: TypedContractMethod<[role: BytesLike], [string], "view">;

  grantRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;

  hasRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [boolean],
    "view"
  >;

  initialize: TypedContractMethod<
    [withdrawalVerifier_: AddressLike, analyzer_: AddressLike],
    [void],
    "nonpayable"
  >;

  nullifiers: TypedContractMethod<[arg0: BytesLike], [bigint], "view">;

  proxiableUUID: TypedContractMethod<[], [string], "view">;

  renounceRole: TypedContractMethod<
    [role: BytesLike, callerConfirmation: AddressLike],
    [void],
    "nonpayable"
  >;

  revokeRole: TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  upgradeToAndCall: TypedContractMethod<
    [newImplementation: AddressLike, data: BytesLike],
    [void],
    "payable"
  >;

  verifyProof: TypedContractMethod<
    [pis: IInt1.WithdrawalPublicInputsStruct, proof: BytesLike],
    [boolean],
    "view"
  >;

  withdraw: TypedContractMethod<
    [publicInputs: IInt1.WithdrawalPublicInputsStruct, proof: BytesLike],
    [void],
    "payable"
  >;

  withdrawalVerifier: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "ANALYZER"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "DEFAULT_ADMIN_ROLE"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "UPGRADE_INTERFACE_VERSION"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "analyzeAndProcessDeposits"
  ): TypedContractMethod<
    [upToDepositId: BigNumberish, rejectDepositIds: BigNumberish[]],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "cancelDeposit"
  ): TypedContractMethod<
    [depositId: BigNumberish, deposit: DepositLib.DepositStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "depositIndex"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "depositNativeToken"
  ): TypedContractMethod<[recipientSaltHash: BytesLike], [void], "payable">;
  getFunction(
    nameOrSignature: "depositRoots"
  ): TypedContractMethod<[arg0: BytesLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getDepositData"
  ): TypedContractMethod<
    [depositId: BigNumberish],
    [DepositQueueLib.DepositDataStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getDepositDataBatch"
  ): TypedContractMethod<
    [depositIds: BigNumberish[]],
    [DepositQueueLib.DepositDataStructOutput[]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getDepositRoot"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getLastDepositId"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getLastProcessedDepositId"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getRoleAdmin"
  ): TypedContractMethod<[role: BytesLike], [string], "view">;
  getFunction(
    nameOrSignature: "grantRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "hasRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [withdrawalVerifier_: AddressLike, analyzer_: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "nullifiers"
  ): TypedContractMethod<[arg0: BytesLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "proxiableUUID"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceRole"
  ): TypedContractMethod<
    [role: BytesLike, callerConfirmation: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "revokeRole"
  ): TypedContractMethod<
    [role: BytesLike, account: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "upgradeToAndCall"
  ): TypedContractMethod<
    [newImplementation: AddressLike, data: BytesLike],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "verifyProof"
  ): TypedContractMethod<
    [pis: IInt1.WithdrawalPublicInputsStruct, proof: BytesLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "withdraw"
  ): TypedContractMethod<
    [publicInputs: IInt1.WithdrawalPublicInputsStruct, proof: BytesLike],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "withdrawalVerifier"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "DepositCanceled"
  ): TypedContractEvent<
    DepositCanceledEvent.InputTuple,
    DepositCanceledEvent.OutputTuple,
    DepositCanceledEvent.OutputObject
  >;
  getEvent(
    key: "DepositLeafInserted"
  ): TypedContractEvent<
    DepositLeafInsertedEvent.InputTuple,
    DepositLeafInsertedEvent.OutputTuple,
    DepositLeafInsertedEvent.OutputObject
  >;
  getEvent(
    key: "Deposited"
  ): TypedContractEvent<
    DepositedEvent.InputTuple,
    DepositedEvent.OutputTuple,
    DepositedEvent.OutputObject
  >;
  getEvent(
    key: "DepositsAnalyzedAndProcessed"
  ): TypedContractEvent<
    DepositsAnalyzedAndProcessedEvent.InputTuple,
    DepositsAnalyzedAndProcessedEvent.OutputTuple,
    DepositsAnalyzedAndProcessedEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "RoleAdminChanged"
  ): TypedContractEvent<
    RoleAdminChangedEvent.InputTuple,
    RoleAdminChangedEvent.OutputTuple,
    RoleAdminChangedEvent.OutputObject
  >;
  getEvent(
    key: "RoleGranted"
  ): TypedContractEvent<
    RoleGrantedEvent.InputTuple,
    RoleGrantedEvent.OutputTuple,
    RoleGrantedEvent.OutputObject
  >;
  getEvent(
    key: "RoleRevoked"
  ): TypedContractEvent<
    RoleRevokedEvent.InputTuple,
    RoleRevokedEvent.OutputTuple,
    RoleRevokedEvent.OutputObject
  >;
  getEvent(
    key: "Upgraded"
  ): TypedContractEvent<
    UpgradedEvent.InputTuple,
    UpgradedEvent.OutputTuple,
    UpgradedEvent.OutputObject
  >;
  getEvent(
    key: "Withdrawn"
  ): TypedContractEvent<
    WithdrawnEvent.InputTuple,
    WithdrawnEvent.OutputTuple,
    WithdrawnEvent.OutputObject
  >;

  filters: {
    "DepositCanceled(uint256)": TypedContractEvent<
      DepositCanceledEvent.InputTuple,
      DepositCanceledEvent.OutputTuple,
      DepositCanceledEvent.OutputObject
    >;
    DepositCanceled: TypedContractEvent<
      DepositCanceledEvent.InputTuple,
      DepositCanceledEvent.OutputTuple,
      DepositCanceledEvent.OutputObject
    >;

    "DepositLeafInserted(uint32,bytes32)": TypedContractEvent<
      DepositLeafInsertedEvent.InputTuple,
      DepositLeafInsertedEvent.OutputTuple,
      DepositLeafInsertedEvent.OutputObject
    >;
    DepositLeafInserted: TypedContractEvent<
      DepositLeafInsertedEvent.InputTuple,
      DepositLeafInsertedEvent.OutputTuple,
      DepositLeafInsertedEvent.OutputObject
    >;

    "Deposited(uint256,address,bytes32,uint32,uint256,uint256)": TypedContractEvent<
      DepositedEvent.InputTuple,
      DepositedEvent.OutputTuple,
      DepositedEvent.OutputObject
    >;
    Deposited: TypedContractEvent<
      DepositedEvent.InputTuple,
      DepositedEvent.OutputTuple,
      DepositedEvent.OutputObject
    >;

    "DepositsAnalyzedAndProcessed(uint256,uint256[],bytes32[])": TypedContractEvent<
      DepositsAnalyzedAndProcessedEvent.InputTuple,
      DepositsAnalyzedAndProcessedEvent.OutputTuple,
      DepositsAnalyzedAndProcessedEvent.OutputObject
    >;
    DepositsAnalyzedAndProcessed: TypedContractEvent<
      DepositsAnalyzedAndProcessedEvent.InputTuple,
      DepositsAnalyzedAndProcessedEvent.OutputTuple,
      DepositsAnalyzedAndProcessedEvent.OutputObject
    >;

    "Initialized(uint64)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "RoleAdminChanged(bytes32,bytes32,bytes32)": TypedContractEvent<
      RoleAdminChangedEvent.InputTuple,
      RoleAdminChangedEvent.OutputTuple,
      RoleAdminChangedEvent.OutputObject
    >;
    RoleAdminChanged: TypedContractEvent<
      RoleAdminChangedEvent.InputTuple,
      RoleAdminChangedEvent.OutputTuple,
      RoleAdminChangedEvent.OutputObject
    >;

    "RoleGranted(bytes32,address,address)": TypedContractEvent<
      RoleGrantedEvent.InputTuple,
      RoleGrantedEvent.OutputTuple,
      RoleGrantedEvent.OutputObject
    >;
    RoleGranted: TypedContractEvent<
      RoleGrantedEvent.InputTuple,
      RoleGrantedEvent.OutputTuple,
      RoleGrantedEvent.OutputObject
    >;

    "RoleRevoked(bytes32,address,address)": TypedContractEvent<
      RoleRevokedEvent.InputTuple,
      RoleRevokedEvent.OutputTuple,
      RoleRevokedEvent.OutputObject
    >;
    RoleRevoked: TypedContractEvent<
      RoleRevokedEvent.InputTuple,
      RoleRevokedEvent.OutputTuple,
      RoleRevokedEvent.OutputObject
    >;

    "Upgraded(address)": TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
    Upgraded: TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;

    "Withdrawn(address,bytes32,uint32,uint256)": TypedContractEvent<
      WithdrawnEvent.InputTuple,
      WithdrawnEvent.OutputTuple,
      WithdrawnEvent.OutputObject
    >;
    Withdrawn: TypedContractEvent<
      WithdrawnEvent.InputTuple,
      WithdrawnEvent.OutputTuple,
      WithdrawnEvent.OutputObject
    >;
  };
}