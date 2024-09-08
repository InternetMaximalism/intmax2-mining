// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Byte32Lib} from "./Byte32Lib.sol";
import {IPlonkVerifier} from "./interfaces/IPlonkVerifier.sol";
import {IINTMAXToken} from "./interfaces/IINTMAXToken.sol";
import {IInt0} from "./interfaces/IInt0.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MinterV0 is Ownable {
    using Byte32Lib for bytes32;

    // structs
    struct MintClaim {
        address recipient;
        bytes32 nullifier;
        uint256 amount;
    }

    struct ClaimPublicInputs {
        bytes32 depositTreeRoot;
        bytes32 eligibleTreeRoot;
        bytes32 lastClaimHash;
    }

    // contracts
    IPlonkVerifier public verifier;
    IINTMAXToken public token;
    IInt0 public int0;

    // state
    bytes32 public eligibleTreeRoot;
    bytes32 public depositTreeRoot;
    mapping(bytes32 => bool) nullifiers;

    constructor(
        address plonkVerifier_,
        address token_,
        address int0_
    ) Ownable(msg.sender) {
        verifier = IPlonkVerifier(plonkVerifier_);
        token = IINTMAXToken(token_);
        int0 = IInt0(int0_);
    }

    function claimTokens(
        MintClaim[] memory claims,
        ClaimPublicInputs memory publicInputs,
        bytes calldata proof
    ) external {
        // verify proof and nullifiers
        bytes32 claimHash = _verifyClaimChain(claims);
        require(
            claimHash == publicInputs.lastClaimHash,
            "Invalid last claim hash"
        );
        bytes32 publicInputsHash = keccak256(
            abi.encodePacked(
                publicInputs.depositTreeRoot,
                publicInputs.eligibleTreeRoot,
                publicInputs.lastClaimHash
            )
        );
        bool success = verifier.Verify(proof, publicInputsHash.split());
        require(success, "Invalid proof");
        for (uint256 i = 0; i < claims.length; i++) {
            MintClaim memory claim = claims[i];
            require(!nullifiers[claim.nullifier], "Nullifier already used");
            nullifiers[claim.nullifier] = true;
        }
        // claim tokens
        for (uint256 i = 0; i < claims.length; i++) {
            _claimTokens(claims[i]);
        }
    }

    function _verifyClaimChain(
        MintClaim[] memory claims
    ) internal pure returns (bytes32) {
        bytes32 lastClaimHash = 0;
        for (uint256 i = 0; i < claims.length; i++) {
            MintClaim memory claim = claims[i];
            lastClaimHash = keccak256(
                abi.encodePacked(
                    lastClaimHash,
                    claim.recipient,
                    claim.nullifier,
                    claim.amount
                )
            );
        }
        return lastClaimHash;
    }

    function _claimTokens(MintClaim memory claim) internal {
        // claim tokens
        token.transfer(claim.recipient, claim.amount);
    }

    function mint() external onlyOwner {
        token.mint(address(this));
    }

    function setTreeRoots(bytes32 eligibleTreeRoot_) external onlyOwner {
        eligibleTreeRoot = eligibleTreeRoot_;
        depositTreeRoot = int0.getDepositRoot();
    }
}
