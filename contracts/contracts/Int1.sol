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

    // external contracts
    IPlonkVerifier public withdrawalVerifier;

    // states
    DepositTreeLib.DepositTree private depositTree;
    DepositQueueLib.DepositQueue private depositQueue;
    uint32 public depositIndex;
    mapping(bytes32 => uint256) public depositRoots;
    mapping(bytes32 => uint256) public nullifiers;

    function initialize(
        address withdrawalVerifier_,
        address analyzer_
    ) external initializer {
        withdrawalVerifier = IPlonkVerifier(withdrawalVerifier_);
        depositTree.initialize();
        depositQueue.initialize();

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(ANALYZER, analyzer_);
    }

    function depositNativeToken(bytes32 recipientSaltHash) external payable {
        if (msg.value == 0) {
            revert TriedToDepositZero();
        }
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
    ) external payable onlyRole(ANALYZER) {
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
    }

    function withdraw(
        WithdrawalPublicInputs memory publicInputs,
        bytes calldata proof
    ) external payable {
        require(
            depositRoots[publicInputs.depositRoot] > 0,
            "Invalid depositRoot"
        );
        require(nullifiers[publicInputs.nullifier] == 0, "Invalid nullifier");
        require(verifyProof(publicInputs, proof), "Invalid proof");
        nullifiers[publicInputs.nullifier] = block.timestamp;
        if (publicInputs.tokenIndex == 0) {
            payable(publicInputs.recipient).transfer(
                publicInputs.amount + msg.value // gas top-up
            );
        }
    }

    function getDepositRoot() external view returns (bytes32) {
        return depositTree.getRoot();
    }

    function rescue() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(_msgSender()).transfer(address(this).balance);
    }

    //=========================utils===========================

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
