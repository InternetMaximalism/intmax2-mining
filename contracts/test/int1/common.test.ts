import { ethers } from 'hardhat'

export const getDepositHash = (
	recipientSaltHash: string | Uint8Array,
	tokenIndex: number,
	amount: bigint,
): string => {
	const packed = ethers.solidityPacked(
		['bytes32', 'uint32', 'uint256'],
		[recipientSaltHash, tokenIndex, amount],
	)
	const hash = ethers.keccak256(packed)
	return hash
}
