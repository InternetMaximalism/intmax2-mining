// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IINTMAXToken} from "../interfaces/IINTMAXToken.sol";

/**
 * @title DummyToken
 */
contract DummyToken is ERC20, AccessControl, IINTMAXToken {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address admin_, address minter_) ERC20("Dummy", "DMY") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, minter_);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC20).interfaceId ||
            interfaceId == type(IINTMAXToken).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Mints tokens to a specified address.
     * @dev Only callable by the minter.
     * @param to The address to mint tokens to.
     */
    function mint(address to) external onlyRole(MINTER_ROLE) {
        _mint(to, 1_000_000 ether);
    }

    /**
     * @notice Burns a specified amount of tokens from the caller's account.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
