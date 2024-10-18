// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IINTMAXToken
 * @dev Interface for the INTMAXToken contract, extending the IERC20 interface.
 */
interface IINTMAXToken is IERC20 {
    /**
     * @dev Emitted when tried to transfer tokens while transfers are not allowed.
     */
    error TransferNotAllowed();

    /**
     * @dev Emitted when tried to start mining while mining has already started.
     */
    error MiningAlreadyStarted();

    /**
     * @dev Emitted when tried to claim tokens while mining has not started.
     */
    error MiningNotStarted();

    /**
     * @notice Returns the total amount of tokens that have been burned.
     * @return The total amount of tokens that have been burned.
     */
    function totalBurnedAmount() external view returns (uint256);

    /**
     * @notice Returns the total amount of tokens that have been claimed
     * @return The total amount of tokens that have been claimed.
     */
    function totalClaimedAmount() external view returns (uint256);

    /**
     * @notice Returns whether transfers are allowed.
     * @return Whether transfers are allowed.
     */
    function transfersAllowed() external view returns (bool);

    /**
     * @notice Mints tokens to a specified address.
     * @dev Only callable by an address with the minter role.
     * @param to The address to receive the minted tokens.
     */
    function mint(address to) external;

    /**
     * @notice Burns a specified amount of tokens from the caller's account.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) external;

    /**
     * @notice Burns a specified amount of tokens from the caller's account, without increasing the total burned amount.
     * @param amount The amount of tokens to burn.
     * @dev This function is used for bridging tokens from other chains.
     */
    function vanish(uint256 amount) external;

    /**
     * @notice Enables token transfers.
     * @dev Only callable by an address with the admin role.
     */
    function allowTransfers() external;

    /**
     * @notice Returns the total amount of tokens that can be minted.
     * @return The total amount of tokens that can be minted.
     */
    function totalMintableAmount() external view returns (uint256);
}
