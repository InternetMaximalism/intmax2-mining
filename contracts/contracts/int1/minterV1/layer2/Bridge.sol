// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// import {OApp, MessagingFee, Origin} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
// import {MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import {IINTMAXToken} from "./token/IINTMAXToken.sol";

// contract Bridge is OApp {
//     IINTMAXToken public token;

//     constructor(
//         address _endpoint,
//         address _delegate
//     ) OApp(_endpoint, _delegate) {}

//     function bridge(uint256 amount) external {}

//     function quote(
//         uint32 _dstEid,
//         string memory _message,
//         bytes memory _options,
//         bool _payInLzToken
//     ) public view returns (MessagingFee memory fee) {
//         bytes memory payload = abi.encode(_message);
//         fee = _quote(_dstEid, payload, _options, _payInLzToken);
//     }

//     function send(
//         uint32 _dstEid,
//         string memory _message,
//         bytes calldata _options
//     ) external payable returns (MessagingReceipt memory receipt) {
//         bytes memory _payload = abi.encode(_message);
//         receipt = _lzSend(
//             _dstEid,
//             _payload,
//             _options,
//             MessagingFee(msg.value, 0),
//             payable(msg.sender)
//         );
//     }

//     function _lzReceive(
//         Origin calldata _origin,
//         bytes32 _guid,
//         bytes calldata _message,
//         address _executor,
//         bytes calldata _extraData
//     ) internal virtual override {
//         string memory message = abi.decode(_message, (string));
//         // emit Received(_origin, _guid, message, _executor, _extraData);
//     }
// }
