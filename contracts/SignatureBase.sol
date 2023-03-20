// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

abstract contract SignatureBase {
    function splitSignature(
        bytes memory signature
    ) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(signature.length == 65, "Singnature length should be 65");

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(
        bytes32 message,
        bytes memory signature
    ) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return ecrecover(message, v, r, s);
    }

    function withPrefix(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
