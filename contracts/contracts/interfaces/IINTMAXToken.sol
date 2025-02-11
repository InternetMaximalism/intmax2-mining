// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IINTMAXToken
 * @dev Interface for the INTMAXToken contract, extending the IERC20 interface.
 */
interface IINTMAXToken is IERC20 {
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
}
