// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeMathTester{
    uint8 public bigNumber = 255; //* unchecked in 0.7.0  // checked in 0.8.0

    function add() public {
        bigNumber = bigNumber + 1; //* se pasa del limite y pone 0
        //? se puede obviar el check del compilador 0.8.0 poniendo:
        //? unchecked {bigNumber = bigNumber + 1;}
        //? el unchecked hace el codigo más gas efficient. !estar seguros de usarlo
    }
}