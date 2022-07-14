//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

//! errores personalizados
error FundMe__NotOwner();

contract FundMe {
	using PriceConverter for uint256;

	//* usando constant ahorra gas frente a non-constant
	uint256 public constant MINIMUM_USD = 50 * 1e18;

	address[] private s_funders;
	mapping(address => uint256) private s_addressToAmountFunded;

	address private immutable i_owner;

	AggregatorV3Interface private s_priceFeed;

	constructor(address priceFeedAddres) {
		i_owner = msg.sender;
		s_priceFeed = AggregatorV3Interface(priceFeedAddres);
	}

	function fund() public payable {
		//* en el caso de que falle el require, todo cambio realizado previamente será revertido
		require(
			msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
			"Didn't send enough!"
		); //? 1ETH = 1e18wei
		s_addressToAmountFunded[msg.sender] += msg.value;
		s_funders.push(msg.sender);
	}

	function withdraw() public onlyOwner {
		for (
			uint256 funderIndex = 0;
			funderIndex < s_funders.length;
			funderIndex++
		) {
			address funder = s_funders[funderIndex];
			s_addressToAmountFunded[funder] = 0;
		}

		//! esto resetea el tamaño del array a 0
		s_funders = new address[](0);

		//! tres modos de transferir fondos / retirar a una dirección
		//? transfer: 2300 gas, throws error
		//* msg.sender = address
		//* payable(msg.sender) = payable address
		//payable(msg.sender).transfer(address(this).balance);

		//? send: 2300 gas, return bool
		//boolean sendSuccess = payable(msg.sender).send(address(this).balance);
		//require(sendSuccess, "Send failed");

		//? call: forward all gas or set gas, returns bool
		(bool callSuccess, ) = payable(msg.sender).call{
			value: address(this).balance
		}("");
		require(callSuccess, "Call failed");
	}

	function cheaperWithdraw() public payable onlyOwner {
		address[] memory funders = s_funders;
		//* mappings no pueden ser memory
		for (
			uint256 funderIndex = 0;
			funderIndex < funders.length;
			funderIndex++
		) {
			address funder = funders[funderIndex];
			s_addressToAmountFunded[funder] = 0;
		}
		s_funders = new address[](0);
		(bool success, ) = i_owner.call{value: address(this).balance}("");
		require(success);
	}

	//! MODIFICADOR
	modifier onlyOwner() {
		//* comprobamos si quien lo solicita es el propietario
		//require(msg.sender == i_owner, "Sender is not ownder!");
		if (msg.sender != i_owner) {
			revert FundMe__NotOwner();
		}
		_; //* la barra baja (underscore) representa hacer el resto de código
		//? si se pone primero la barra baja hacer primero el código y luego el modificador
	}

	//? Que ocurre si alguien envía a este contrato ETH sin haber llamado a la función fund

	//! receive
	receive() external payable {
		fund();
	}

	//! fallback
	fallback() external payable {
		fund();
	}

	function getOwner() public view returns (address) {
		return i_owner;
	}

	function getFunder(uint256 index) public view returns (address) {
		return s_funders[index];
	}

	function getAddressToAmountFunded(address funder)
		public
		view
		returns (uint256)
	{
		return s_addressToAmountFunded[funder];
	}

	function getPriceFeed() public view returns (AggregatorV3Interface) {
		return s_priceFeed;
	}
}
