// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IINTMAXToken
 * @dev Interface for the INTMAXToken contract, extending the IERC20 interface.
 */
interface IINTMAXToken is IERC20 {
    /**
     * @notice Mints tokens to a specified address.
     * @dev Only callable by the minter.
     * @param to The address to mint tokens to.
     */
    function mint(address to) external;

    /**
     * @notice Burns a specified amount of tokens from the caller's account.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) external;

    /**
     * @notice Returns the total amount of tokens that can be minted.
     * @return The total amount of tokens that can be minted.
     */
    function totalMintableAmount() external view returns (uint256);
}
