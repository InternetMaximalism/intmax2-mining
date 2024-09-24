// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// interfaces
import {IMinterV1} from "./interfaces/IMinterV1.sol";
import {IInt1} from "./interfaces/IInt1.sol";
import {IPlonkVerifier} from "./interfaces/IPlonkVerifier.sol";
import {IINTMAXToken} from "./interfaces/IINTMAXToken.sol";

// libs
import {Byte32Lib} from "./lib/Byte32Lib.sol";

// contracts
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract MinterV1 is UUPSUpgradeable, AccessControlUpgradeable, IMinterV1 {
    using Byte32Lib for bytes32;

    // contracts
    IPlonkVerifier public verifier;
    IINTMAXToken public token;
    IInt1 public int1;

    // state
    bytes32 public eligibleTreeRoot;
    mapping(bytes32 => bool) public nullifiers;

    function initialize(
        address plonkVerifier_,
        address token_,
        address int1_,
        address admin_
    ) public initializer {
        verifier = IPlonkVerifier(plonkVerifier_);
        token = IINTMAXToken(token_);
        int1 = IInt1(int1_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
    }

    function claimTokens(
        MintClaim[] memory claims,
        ClaimPublicInputs memory publicInputs,
        bytes calldata proof
    ) external {
        if (publicInputs.eligibleTreeRoot != eligibleTreeRoot) {
            revert EligibleTreeRootMismatch({
                given: publicInputs.eligibleTreeRoot,
                expected: eligibleTreeRoot
            });
        }
        if (int1.depositRoots(publicInputs.depositTreeRoot) == 0) {
            revert InvalidDepositTreeRoot(publicInputs.depositTreeRoot);
        }
        bytes32 lastClaimHash = _verifyClaimChain(claims);
        if (publicInputs.lastClaimHash != lastClaimHash) {
            revert LastClaimHashMismatch({
                given: publicInputs.lastClaimHash,
                expected: lastClaimHash
            });
        }
        bytes32 publicInputsHash = keccak256(
            abi.encodePacked(
                publicInputs.depositTreeRoot,
                publicInputs.eligibleTreeRoot,
                publicInputs.lastClaimHash
            )
        );
        if (!verifier.Verify(proof, publicInputsHash.split())) {
            revert InvalidProof();
        }
        for (uint256 i = 0; i < claims.length; i++) {
            MintClaim memory claim = claims[i];
            if (nullifiers[claim.nullifier]) {
                revert UsedNullifier(claim.nullifier);
            }
            nullifiers[claim.nullifier] = true;
            token.transfer(claim.recipient, claim.amount);
            emit Claimed(claim.recipient, claim.nullifier, claim.amount);
        }
    }

    function mint() public onlyRole(DEFAULT_ADMIN_ROLE) {
        token.mint(address(this));
    }

    function setTreeRoots(
        bytes32 eligibleTreeRoot_,
        uint256 targetBalance
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        eligibleTreeRoot = eligibleTreeRoot_;
        uint256 balance = token.balanceOf(address(this));
        uint256 burnAmount = balance - targetBalance;
        token.burn(burnAmount);
    }

    function migrate(address newMinter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(newMinter, balance);
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

    function _authorizeUpgrade(
        address
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
