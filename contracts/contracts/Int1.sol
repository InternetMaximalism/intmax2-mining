// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// interfaces
import {IInt1} from "./interfaces/IInt1.sol";
import {IPlonkVerifier} from "./interfaces/IPlonkVerifier.sol";

// libs
import {DepositLib} from "./lib/DepositLib.sol";
import {DepositTreeLib} from "./lib/DepositTreeLib.sol";
import {DepositQueueLib} from "./lib/DepositQueueLib.sol";

// contracts
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract Int1 is IInt1, UUPSUpgradeable, AccessControlUpgradeable {
    using DepositTreeLib for DepositTreeLib.DepositTree;
    using DepositQueueLib for DepositQueueLib.DepositQueue;
    using DepositLib for DepositLib.Deposit;

    // roles
    bytes32 public constant ANALYZER = keccak256("ANALYZER");
    bytes32 public constant WITHDRAWER = keccak256("WITHDRAWER");

    uint256 public constant TX_BASE_GAS = 21000;
    uint256 public constant TX_TRANSFER_GAS = 2300;

    // contracts
    IPlonkVerifier public withdrawalVerifier;

    // states
    uint32 public depositIndex;
    DepositTreeLib.DepositTree private depositTree;
    DepositQueueLib.DepositQueue private depositQueue;
    mapping(bytes32 => uint256) public depositRoots;
    mapping(bytes32 => uint256) public nullifiers;
    mapping(bytes32 => bool) private alreadyUseRecipientSaltHash;

    modifier canDeposit(bytes32 recipientSaltHash) {
        if (alreadyUseRecipientSaltHash[recipientSaltHash]) {
            revert RecipientSaltHashAlreadyUsed();
        }
        _;
    }

    modifier canCancelDeposit(
        uint256 depositId,
        DepositLib.Deposit memory deposit
    ) {
        DepositQueueLib.DepositData memory depositData = depositQueue
            .depositData[depositId];
        if (depositData.sender != _msgSender()) {
            revert OnlySenderCanCancelDeposit();
        }
        bytes32 depositHash = deposit.getHash();
        if (depositData.depositHash != depositHash) {
            revert InvalidDepositHash(depositData.depositHash, depositHash);
        }
        if (depositId <= getLastProcessedDepositId()) {
            if (depositData.isRejected == false) {
                revert AlreadyAnalyzed();
            }
        }
        _;
    }

    function initialize(
        address withdrawalVerifier_,
        address admin_
    ) external initializer {
        withdrawalVerifier = IPlonkVerifier(withdrawalVerifier_);
        depositTree.initialize();
        depositQueue.initialize();

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
    }

    function depositNativeToken(
        bytes32 recipientSaltHash
    ) external payable canDeposit(recipientSaltHash) {
        if (msg.value == 0) {
            revert TriedToDepositZero();
        }
        alreadyUseRecipientSaltHash[recipientSaltHash] = true;
        bytes32 depositHash = DepositLib
            .Deposit(recipientSaltHash, 0, msg.value)
            .getHash();
        uint256 depositId = depositQueue.enqueue(depositHash, _msgSender());
        emit Deposited(
            depositId,
            _msgSender(),
            recipientSaltHash,
            0,
            msg.value,
            block.timestamp
        );
    }

    function analyzeAndProcessDeposits(
        uint256 upToDepositId,
        uint256[] memory rejectDepositIds
    ) external onlyRole(ANALYZER) {
        bytes32[] memory depositHashes = depositQueue.analyze(
            upToDepositId,
            rejectDepositIds
        );
        for (uint256 i = 0; i < depositHashes.length; i++) {
            depositTree.deposit(depositHashes[i]);
            emit DepositLeafInserted(depositIndex, depositHashes[i]);
            depositIndex++;
        }
        bytes32 root = depositTree.getRoot();
        depositRoots[root] = block.timestamp;

        emit DepositsAnalyzedAndProcessed(
            upToDepositId,
            rejectDepositIds,
            depositHashes
        );
    }

    function cancelDeposit(
        uint256 depositId,
        DepositLib.Deposit calldata deposit
    ) external canCancelDeposit(depositId, deposit) {
        DepositQueueLib.DepositData memory depositData = depositQueue
            .deleteDeposit(depositId);
        if (depositData.sender != _msgSender()) {
            revert OnlySenderCanCancelDeposit();
        }
        if (depositData.depositHash != deposit.getHash()) {
            revert InvalidDepositHash(
                depositData.depositHash,
                deposit.getHash()
            );
        }
        payable(depositData.sender).transfer(deposit.amount);
        emit DepositCanceled(depositId);
    }

    function withdraw(
        WithdrawalPublicInputs memory publicInputs,
        bytes calldata proof
    ) external payable {
        uint256 startGas = gasleft();
        if (depositRoots[publicInputs.depositRoot] == 0) {
            revert InvalidDepositRoot(publicInputs.depositRoot);
        }
        if (nullifiers[publicInputs.nullifier] != 0) {
            revert UsedNullifier(publicInputs.nullifier);
        }
        if (!verifyProof(publicInputs, proof)) {
            revert InvalidProof();
        }
        if (publicInputs.tokenIndex != 0) {
            revert InvalidTokenIndex();
        }
        nullifiers[publicInputs.nullifier] = block.timestamp;

        emit Withdrawn(
            publicInputs.recipient,
            publicInputs.nullifier,
            publicInputs.tokenIndex,
            publicInputs.amount
        );

        // fund transfer and compensation
        if (hasRole(WITHDRAWER, _msgSender())) {
            uint256 compensation = (TX_BASE_GAS +
                2 *
                TX_TRANSFER_GAS +
                startGas -
                gasleft()) * tx.gasprice;
            if (compensation > publicInputs.amount + msg.value) {
                revert GasTooHigh();
            }
            payable(publicInputs.recipient).transfer(
                publicInputs.amount + msg.value - compensation
            );
            payable(_msgSender()).transfer(compensation);
        } else {
            payable(publicInputs.recipient).transfer(
                publicInputs.amount + msg.value
            );
        }
    }

    function getDepositData(
        uint256 depositId
    ) external view returns (DepositQueueLib.DepositData memory) {
        return depositQueue.depositData[depositId];
    }

    function getDepositDataBatch(
        uint256[] memory depositIds
    ) external view returns (DepositQueueLib.DepositData[] memory) {
        DepositQueueLib.DepositData[]
            memory depositData = new DepositQueueLib.DepositData[](
                depositIds.length
            );
        for (uint256 i = 0; i < depositIds.length; i++) {
            depositData[i] = depositQueue.depositData[depositIds[i]];
        }
        return depositData;
    }

    function getDepositRoot() external view returns (bytes32) {
        return depositTree.getRoot();
    }

    function getLastProcessedDepositId() public view returns (uint256) {
        return depositQueue.front - 1;
    }

    function getLastDepositId() external view returns (uint256) {
        return depositQueue.rear - 1;
    }

    function verifyProof(
        WithdrawalPublicInputs memory pis,
        bytes calldata proof
    ) public view returns (bool) {
        bytes32 pisHash = keccak256(
            abi.encodePacked(
                pis.depositRoot,
                pis.nullifier,
                pis.recipient,
                pis.tokenIndex,
                pis.amount
            )
        );
        return withdrawalVerifier.Verify(proof, splitBytes32(pisHash));
    }

    function splitBytes32(
        bytes32 input
    ) internal pure returns (uint256[] memory) {
        uint256[] memory parts = new uint256[](8);
        for (uint256 i = 0; i < 8; i++) {
            parts[i] = uint256(uint32(bytes4(input << (i * 32))));
        }
        return parts;
    }

    function _authorizeUpgrade(
        address
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
