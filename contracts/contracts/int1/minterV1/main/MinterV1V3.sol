// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// interfaces
import {IMinterV1L} from "../layer2/IMinterV1.sol";
import {IInt1} from "../../../interfaces/IInt1.sol";
import {IPlonkVerifier} from "../../../interfaces/IPlonkVerifier.sol";
import {IINTMAXToken} from "../../../interfaces/IINTMAXToken.sol";

// libs
import {Byte32Lib} from "../../../lib/Byte32Lib.sol";

// contracts
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

// Almost same as MinterV1L but with small modification on Upgradability
contract MinterV1V3 is UUPSUpgradeable, AccessControlUpgradeable, IMinterV1L {
    using Byte32Lib for bytes32;

    // roles that post eligible tree roots
    bytes32 public constant TREE_MANAGER = keccak256("TREE_MANAGER");

    // Not used in this contract; left for the upgrade compatibility
    bytes32 public eligibleTreeRoot;
    mapping(bytes32 => bool) public nullifiers;

    // contracts
    IPlonkVerifier public verifier;
    IINTMAXToken public token;
    IInt1 public int1;

    // New state 
    bytes32 public shortTermEligibleTreeRoot;
    mapping(bytes32 => bool) public shortTermNullifiers;

    bytes32 public longTermEligibleTreeRoot;
    mapping(bytes32 => bool) public longTermNullifiers;

    function claimTokens(
        bool isShortTerm,
        MintClaim[] memory claims,
        ClaimPublicInputs memory publicInputs,
        bytes calldata proof
    ) external {
        if (isShortTerm) {
            if (publicInputs.eligibleTreeRoot != shortTermEligibleTreeRoot) {
                revert EligibleTreeRootMismatch({
                    given: publicInputs.eligibleTreeRoot,
                    expected: shortTermEligibleTreeRoot
                });
            }
        } else {
            if (publicInputs.eligibleTreeRoot != longTermEligibleTreeRoot) {
                revert EligibleTreeRootMismatch({
                    given: publicInputs.eligibleTreeRoot,
                    expected: longTermEligibleTreeRoot
                });
            }
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
            if (isShortTerm) {
                if (shortTermNullifiers[claim.nullifier]) {
                    revert UsedNullifier(claim.nullifier);
                }
                shortTermNullifiers[claim.nullifier] = true;
            } else {
                if (longTermNullifiers[claim.nullifier]) {
                    revert UsedNullifier(claim.nullifier);
                }
                longTermNullifiers[claim.nullifier] = true;
            }
            token.transfer(claim.recipient, claim.amount);
            emit Claimed(claim.recipient, claim.nullifier, claim.amount);
        }
    }

    function mint() public onlyRole(TREE_MANAGER) {
        token.mint(address(this));
    }

    function setVerifier(
        address verifier_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        verifier = IPlonkVerifier(verifier_);
    }

    function setShortTermTreeRoot(
        bytes32 eligibleTreeRoot_
    ) external onlyRole(TREE_MANAGER) {
        shortTermEligibleTreeRoot = eligibleTreeRoot_;
    }

    function setLongTermTreeRoot(
        bytes32 eligibleTreeRoot_
    ) external onlyRole(TREE_MANAGER) {
        longTermEligibleTreeRoot = eligibleTreeRoot_;
    }

    function migrate(address newMinter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(newMinter, balance);
    }

    function burn(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        token.burn(amount);
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
