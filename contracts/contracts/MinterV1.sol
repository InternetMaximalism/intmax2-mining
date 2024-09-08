// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IL1ScrollMessenger} from "@scroll-tech/contracts/L1/IL1ScrollMessenger.sol";
import {IMinterV1} from "./interfaces/IMinterV1.sol";
import {IINTMAXToken} from "./interfaces/IINTMAXToken.sol";
import {ICommon} from "./interfaces/ICommon.sol";

contract MinterV1 is IMinterV1, Ownable {
    // contracts
    IL1ScrollMessenger public l1ScrollMessenger;
    IINTMAXToken public token;
    address public mintVerifier;

    error MintVerifierNotSet();
    error SenderIsNotScrollMessenger();
    error InvalidMintVerifier();

    modifier onlyMintVerifier() {
        if (mintVerifier == address(0)) {
            revert MintVerifierNotSet();
        }
        if (msg.sender != address(l1ScrollMessenger)) {
            revert SenderIsNotScrollMessenger();
        }
        if (mintVerifier != l1ScrollMessenger.xDomainMessageSender()) {
            revert InvalidMintVerifier();
        }
        _;
    }

    constructor(
        address l1ScrollMessenger_,
        address mintVerifier_
    ) Ownable(msg.sender) {
        l1ScrollMessenger = IL1ScrollMessenger(l1ScrollMessenger_);
        mintVerifier = mintVerifier_;
    }

    function processClaims(
        ICommon.MintClaim[] memory claims
    ) external onlyMintVerifier {
        for (uint256 i = 0; i < claims.length; i++) {
            ICommon.MintClaim memory claim = claims[i];
            token.transfer(claim.recipient, claim.amount);
        }
    }

    function mint() external onlyOwner {
        token.mint(address(this));
    }
}
