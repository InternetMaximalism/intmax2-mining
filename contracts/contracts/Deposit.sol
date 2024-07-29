// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Deposit {
    /**
     * @dev Thrown when the merkle tree is full
     */
    error MerkleTreeFull();

    uint256 internal constant _DEPOSIT_CONTRACT_TREE_DEPTH = 32;

    uint256 internal constant _MAX_DEPOSIT_COUNT =
        2 ** _DEPOSIT_CONTRACT_TREE_DEPTH - 1;

    bytes32[_DEPOSIT_CONTRACT_TREE_DEPTH] internal _branch;

    uint256 public depositCount;

    function _getDepositRoot(
        bytes32 defaultHash
    ) internal view returns (bytes32) {
        bytes32 node = defaultHash;
        uint256 size = depositCount;
        bytes32 currentZeroHashHeight = defaultHash;

        for (
            uint256 height = 0;
            height < _DEPOSIT_CONTRACT_TREE_DEPTH;
            height++
        ) {
            if (((size >> height) & 1) == 1)
                node = keccak256(abi.encodePacked(_branch[height], node));
            else
                node = keccak256(abi.encodePacked(node, currentZeroHashHeight));

            currentZeroHashHeight = keccak256(
                abi.encodePacked(currentZeroHashHeight, currentZeroHashHeight)
            );
        }
        return node;
    }

    /**
     * @notice Add a new leaf to the merkle tree
     * @param leafHash Leaf hash
     */
    function _deposit(bytes32 leafHash) internal {
        bytes32 node = leafHash;

        // Avoid overflowing the Merkle tree (and prevent edge case in computing `_branch`)
        if (depositCount >= _MAX_DEPOSIT_COUNT) {
            revert MerkleTreeFull();
        }

        // Add deposit data root to Merkle tree (update a single `_branch` node)
        uint256 size = ++depositCount;
        for (
            uint256 height = 0;
            height < _DEPOSIT_CONTRACT_TREE_DEPTH;
            height++
        ) {
            if (((size >> height) & 1) == 1) {
                _branch[height] = node;
                return;
            }
            node = keccak256(abi.encodePacked(_branch[height], node));
        }
        // As the loop should always end prematurely with the `return` statement,
        // this code should be unreachable. We assert `false` just to be safe.
        assert(false);
    }

    /**
     * @notice Verify merkle proof
     * @param leafHash Leaf hash
     * @param smtProof Smt proof
     * @param index Index of the leaf
     * @param root Merkle root
     */
    function verifyMerkleProof(
        bytes32 leafHash,
        bytes32[_DEPOSIT_CONTRACT_TREE_DEPTH] calldata smtProof,
        uint32 index,
        bytes32 root
    ) public pure returns (bool) {
        bytes32 node = leafHash;

        // Check merkle proof
        for (
            uint256 height = 0;
            height < _DEPOSIT_CONTRACT_TREE_DEPTH;
            height++
        ) {
            if (((index >> height) & 1) == 1)
                node = keccak256(abi.encodePacked(smtProof[height], node));
            else node = keccak256(abi.encodePacked(node, smtProof[height]));
        }

        return node == root;
    }

    function getBranch()
        public
        view
        returns (bytes32[_DEPOSIT_CONTRACT_TREE_DEPTH] memory)
    {
        return _branch;
    }
}
