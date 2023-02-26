// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

abstract contract PayableContext {
    function _msgValue() internal view virtual returns (uint256) {
        return msg.value;
    }
}
