/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  DepositTreeLib,
  DepositTreeLibInterface,
} from "../../../contracts/lib/DepositTreeLib";

const _abi = [
  {
    inputs: [],
    name: "MerkleTreeFull",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566050600b82828239805160001a6073146043577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea2646970667358221220873620b23ed951ee76e553ec8f46e0bef88f5d9d4320dd8de511a1fe74d26dda64736f6c63430008180033";

type DepositTreeLibConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DepositTreeLibConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DepositTreeLib__factory extends ContractFactory {
  constructor(...args: DepositTreeLibConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      DepositTreeLib & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): DepositTreeLib__factory {
    return super.connect(runner) as DepositTreeLib__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DepositTreeLibInterface {
    return new Interface(_abi) as DepositTreeLibInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): DepositTreeLib {
    return new Contract(address, _abi, runner) as unknown as DepositTreeLib;
  }
}
