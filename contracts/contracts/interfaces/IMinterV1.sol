// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {ICommon} from "./ICommon.sol";

interface IMinterV1 {
    function processClaims(ICommon.MintClaim[] memory claims) external;

    function mint() external;
}
