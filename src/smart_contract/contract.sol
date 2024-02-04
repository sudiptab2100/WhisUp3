// SPDX-License-Identifier: GPL-3.0
/*
    * @title WhisUp3
    * @dev This contract is used to store public keys of users
    * Uploaded to Sepolia testnet
    * Contract address: 0xf44f4a08786BDD99A30b1765467f41b32650A6A4
 */
pragma solidity >=0.7.0 <0.9.0;

contract WhisUp3 {
    mapping(address => string) pubKeys;
    
    function setPubKey(string calldata key) public {
        pubKeys[msg.sender] = key;
    }
    
    function getPubKey(address addr) public  view returns (string memory key) {
        key = pubKeys[addr];
    }
}
