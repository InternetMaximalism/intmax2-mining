// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IInt1 {
    error TriedToDepositZero();

    struct DepositLeaf {
        bytes32 pubkeySaltHash;
        uint32 tokenIndex;
        uint256 amount;
    }

    struct WithdrawalPublicInputs {
        bytes32 depositRoot;
        bytes32 nullifier;
        address recipient;
        uint32 tokenIndex;
        uint256 amount;
    }

    event Deposited(
        uint256 indexed depositId,
        address indexed sender,
        bytes32 indexed recipientSaltHash,
        uint32 tokenIndex,
        uint256 amount,
        uint256 depositedAt
    );

    event DepositLeafInserted(
        uint32 indexed depositIndex,
        bytes32 indexed depositHash
    );
}
