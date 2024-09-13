// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Byte32Lib} from "./lib/Byte32Lib.sol";
import {IPlonkVerifier} from "./interfaces/IPlonkVerifier.sol";
import {IRollup} from "./interfaces/IRollup.sol";
import {IL2ScrollMessenger} from "@scroll-tech/contracts/L2/IL2ScrollMessenger.sol";
import {ICommon} from "./interfaces/ICommon.sol";
import {IMinterV2} from "./interfaces/IMinterV2.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MintVerifier is Ownable {
    using Byte32Lib for bytes32;

    struct ClaimPublicInputs {
        bytes32 depositTreeRoot;
        bytes32 eligibleTreeRoot;
        bytes32 lastClaimHash;
    }

    // contracts
    IPlonkVerifier public verifier;
    IRollup public rollup;
    IL2ScrollMessenger private l2ScrollMessenger;
    address public minter;

    // state
    bytes32 public eligibleTreeRoot;
    bytes32 public depositTreeRoot;
    mapping(bytes32 => bool) nullifiers;

    constructor(
        address plonkVerifier_,
        address rollup_,
        address l2ScrollMessenger_,
        address minter_
    ) Ownable(msg.sender) {
        verifier = IPlonkVerifier(plonkVerifier_);
        rollup = IRollup(rollup_);
        l2ScrollMessenger = IL2ScrollMessenger(l2ScrollMessenger_);
        minter = minter_;
    }

    function claimTokens(
        ICommon.MintClaim[] memory claims,
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
            ICommon.MintClaim memory claim = claims[i];
            require(!nullifiers[claim.nullifier], "Nullifier already used");
            nullifiers[claim.nullifier] = true;
        }

        _relayClaims(claims);
    }

    function _verifyClaimChain(
        ICommon.MintClaim[] memory claims
    ) internal pure returns (bytes32) {
        bytes32 lastClaimHash = 0;
        for (uint256 i = 0; i < claims.length; i++) {
            ICommon.MintClaim memory claim = claims[i];
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

    function _relayClaims(ICommon.MintClaim[] memory claims) internal {
        uint256 value = 0;
        uint256 gasLimit = type(uint256).max;
        bytes memory message = abi.encodeWithSelector(
            IMinterV2.processClaims.selector,
            claims
        );
        l2ScrollMessenger.sendMessage{value: value}(
            minter,
            value,
            message,
            gasLimit,
            _msgSender()
        );
    }

    function setTreeRoots(bytes32 eligibleTreeRoot_) external onlyOwner {
        eligibleTreeRoot = eligibleTreeRoot_;
        depositTreeRoot = rollup.depositTreeRoot();
    }
}
