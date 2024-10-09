// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// import {OApp, MessagingFee, Origin} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import {IINTMAXToken} from "./token/IINTMAXToken.sol";

contract Bridge {
    IINTMAXToken public token;

    function bridge(uint256 amount) external {}

    // function quote(
    //     uint32 _dstEid,
    //     string memory _message,
    //     bytes memory _options,
    //     bool _payInLzToken
    // ) public view returns (MessagingFee memory fee) {
    //     bytes memory payload = abi.encode(_message);
    //     fee = _quote(_dstEid, payload, _options, _payInLzToken);
    // }

    // function send(
    //     uint32 _dstEid,
    //     string memory _message,
    //     bytes calldata _options
    // ) external payable returns (MessagingReceipt memory receipt) {
    //     bytes memory _payload = abi.encode(_message);
    //     receipt = _lzSend(
    //         _dstEid,
    //         _payload,
    //         _options,
    //         MessagingFee(msg.value, 0),
    //         payable(msg.sender)
    //     );
    // }
}
