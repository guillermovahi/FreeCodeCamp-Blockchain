//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract FundMe {
    
    uint256 public minimumUsd = 50;

    function fund() public payable{
        
        //* en el caso de que falle el require, todo cambio realizado previamente será revertido
        require(msg.value >= minimumUsd, "Didn't send enough!"); //? 1ETH = 1e18wei
    }

    function getPrice() public {
        //* necesitamos el ABI y la dirección del contrato: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        //? se usa el contrato asociado al precio de los oraculos de chainlink


    }

    function getVersion() public view returns (uint256) {
        
    }
    // function withdraw() {

    // }
}