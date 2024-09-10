// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Deposit} from "./Deposit.sol";
import {IPlonkVerifier} from "./interfaces/IPlonkVerifier.sol";

contract Int0 is Deposit {
    struct DepositLeaf {
        bytes32 pubkeySaltHash;
        uint32 tokenIndex;
        uint256 amount;
    }

    struct PublicInputs {
        bytes32 depositRoot;
        bytes32 nullifier;
        address recipient;
        uint32 tokenIndex;
        uint256 amount;
    }

    event Deposited(
        uint32 indexed leafIndex,
        bytes32 leafHash,
        bytes32 pubkeySaltHash,
        uint32 tokenIndex,
        uint256 amount
    );

    uint32 public leafIndex;
    address public verifierAddress;
    address public owner;

    mapping(bytes32 => uint256) public depositRoots;
    mapping(bytes32 => uint256) public nullifiers;

    constructor(address verifierAddress_, address owner_) {
        verifierAddress = verifierAddress_;
        owner = owner_;
    }

    function deposit(DepositLeaf memory leaf) public payable {
        require(
            leaf.tokenIndex == 0,
            "Currently only tokenIndex 0 is supported"
        );
        require(msg.value == leaf.amount, "Invalid amount");
        bytes32 leafHash = getLeafHash(leaf);
        _deposit(leafHash);
        emit Deposited(
            leafIndex,
            leafHash,
            leaf.pubkeySaltHash,
            leaf.tokenIndex,
            leaf.amount
        );
        bytes32 root = getDepositRoot();
        depositRoots[root] = block.timestamp;
        leafIndex++;
    }

    function withdraw(
        PublicInputs memory publicInputs,
        bytes calldata proof
    ) public payable {
        require(
            depositRoots[publicInputs.depositRoot] > 0,
            "Invalid depositRoot"
        );
        require(nullifiers[publicInputs.nullifier] == 0, "Invalid nullifier");
        require(verifyProof(publicInputs, proof), "Invalid proof");
        nullifiers[publicInputs.nullifier] = block.timestamp;
        if (publicInputs.tokenIndex == 0) {
            payable(publicInputs.recipient).transfer(
                publicInputs.amount + msg.value
            ); // gas top-up
        }
    }

    function rescue() public {
        require(msg.sender == owner, "Only owner can rescue");
        payable(owner).transfer(address(this).balance);
    }

    //=========================utils===========================

    function getDepositRoot() public view returns (bytes32) {
        DepositLeaf memory leaf = DepositLeaf(0, 0, 0);
        bytes32 defaultHash = getLeafHash(leaf);
        return _getDepositRoot(defaultHash);
    }

    function verifyProof(
        PublicInputs memory pis,
        bytes calldata proof
    ) public view returns (bool) {
        bytes32 pisHash = getPublicInputsHash(pis);
        return
            IPlonkVerifier(verifierAddress).Verify(
                proof,
                splitBytes32(pisHash)
            );
    }

    function getLeafHash(
        DepositLeaf memory depositLeaf
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    depositLeaf.pubkeySaltHash,
                    depositLeaf.tokenIndex,
                    depositLeaf.amount
                )
            );
    }

    function getPublicInputsHash(
        PublicInputs memory publicInputs
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    publicInputs.depositRoot,
                    publicInputs.nullifier,
                    publicInputs.recipient,
                    publicInputs.tokenIndex,
                    publicInputs.amount
                )
            );
    }

    function splitBytes32(
        bytes32 input
    ) public pure returns (uint256[] memory) {
        uint256[] memory parts = new uint256[](8);
        for (uint256 i = 0; i < 8; i++) {
            parts[i] = uint256(uint32(bytes4(input << (i * 32))));
        }
        return parts;
    }
}
