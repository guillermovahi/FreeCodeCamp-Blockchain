// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SimpleStorage.sol";

//! ExtraStorage hereda de SimpleStorage
contract ExtraStorage is SimpleStorage {

    //* Si queremos hacer override debemos asignar el párametro virtual a la función original 
    //* y override a la que modificará la original
    function store(uint256 _favoriteNumber) public override {
        favoriteNumber = _favoriteNumber + 5;
    }
}