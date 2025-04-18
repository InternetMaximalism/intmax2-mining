// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IMinterV1L {
    /// @notice Error thrown when the eligible tree root is invalid
    error EligibleTreeRootMismatch(bytes32 given, bytes32 expected);

    /// @notice Error thrown when the deposit tree root is invalid
    error InvalidDepositTreeRoot(bytes32 depositTreeRoot);

    /// @notice Error thrown when the last claim hash is invalid
    error LastClaimHashMismatch(bytes32 given, bytes32 expected);

    /// @notice Error thrown when the proof is invalid
    error InvalidProof();

    /// @notice Error thrown when the nullifier is already used
    /// @param nullifier The nullifier
    error UsedNullifier(bytes32 nullifier);

    event Claimed(
        address indexed recipient,
        bytes32 indexed nullifier,
        uint256 amount
    );

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

    function claimTokens(
        bool isShortTerm,
        MintClaim[] memory claims,
        ClaimPublicInputs memory publicInputs,
        bytes calldata proof
    ) external;

    function setVerifier(address verifier_) external;

    function setShortTermTreeRoot(bytes32 eligibleTreeRoot_) external;

    function setLongTermTreeRoot(bytes32 eligibleTreeRoot_) external;

    function mint() external;

    function migrate(address newMinter) external;

    function burn(uint256 amount) external;
}
