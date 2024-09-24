// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IInt1 {
    /// @notice Error thrown when already analyzed deposits
    error AlreadyAnalyzed();

    /// @notice Error thrown when the recipientSaltHash is already used
    error RecipientSaltHashAlreadyUsed();

    /// @notice Error thrown when trying to deposit zero amount of native token
    error TriedToDepositZero();

    /// @notice Error thrown when someone other than the original depositor tries to cancel a deposit
    error OnlySenderCanCancelDeposit();

    /// @notice Error thrown when the provided deposit hash doesn't match the calculated hash during cancellation
    /// @param depositDataHash The hash from the deposit data
    /// @param calculatedHash The hash calculated from given input
    error InvalidDepositHash(bytes32 depositDataHash, bytes32 calculatedHash);

    event DepositCanceled(uint256 indexed depositId);

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

    event DepositsAnalyzedAndProcessed(
        uint256 indexed upToDepositId,
        uint256[] rejectedIndices,
        bytes32[] depositHashes
    );

    event Withdrawn(
        address indexed recipient,
        bytes32 indexed nullifier,
        uint32 tokenIndex,
        uint256 amount
    );

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

    function depositNativeToken(bytes32 recipientSaltHash) external payable;

    function analyzeAndProcessDeposits(
        uint256 upToDepositId,
        uint256[] memory rejectDepositIds
    ) external;

    function withdraw(
        WithdrawalPublicInputs memory publicInputs,
        bytes calldata proof
    ) external payable;

    function getDepositRoot() external view returns (bytes32);

    function getLastProcessedDepositId() external view returns (uint256);

    function getLastDepositId() external view returns (uint256);

    function depositRoots(bytes32 depositRoot) external view returns (uint256);
}
