// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICommon {
    struct MintClaim {
        address recipient;
        bytes32 nullifier;
        uint256 amount;
    }
}
